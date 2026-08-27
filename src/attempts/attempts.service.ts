import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { CreateScenarioAttemptDto } from './dto/create-scenario-attempt.dto';
import { Status, Prisma } from '@prisma/client';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) { }

  // Create a new attempt row when a learner starts a module
  async createAttempt(userId: number, dto: CreateAttemptDto) {
    const module = await this.prisma.module.findUnique({
      where: { id: dto.moduleId },
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${dto.moduleId} not found`);
    }

    return this.prisma.moduleResults.create({
      data: {
        userId,
        moduleId: dto.moduleId,
        organisationId: module.organisationId,
        status: Status.IN_PROGRESS,
        total_score: 0,
        max_possible_score: 0,
        percentage_score: 0,
        scenarios_completed: 0,
        total_scenarios: 0,
        passed: false,
        feedback: '',
        startedAt: new Date(),
      },
    });
  }

  //Learner submits an answer for a scenario within an attempt
  async submitScenarioAttempt(
    userId: number,
    attemptId: number,
    dto: CreateScenarioAttemptDto,
  ) {
    const moduleResults = await this.ensureOwnedByUser(attemptId, userId);

    //Check learners selection belongs to the correct scenario
    const scenario = await this.prisma.scenario.findUnique({
      where: { id: dto.scenarioId },
    });
    if (!scenario) {
      throw new NotFoundException(
        `Scenario and ID combination ${dto.scenarioId} not found`,
      );
    }

    //validate scenarioId actually belongs to moduleId
    if (scenario.moduleId !== dto.moduleId) {
      throw new BadRequestException(`Scenario ${dto.scenarioId} does not belong to module ${dto.moduleId}`,
      );
    }

    const selectedCues = dto.selectedCues ?? [];
    const correctAnswer = scenario.correctAnswer as unknown as string | null;
    let isCorrect: boolean;
    let missedCues: string[] = [];
    let score: number;

    if (correctAnswer) {
      isCorrect = dto.response.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      score = isCorrect ? 100 : 0;
    } else {
      const correctCues = (scenario.correctCues ?? []) as unknown as string[];
      missedCues = correctCues.filter((cue) => !selectedCues.includes(cue));
      const cueAccuracy = correctCues.length === 0 ? 1 : (correctCues.length - missedCues.length) / correctCues.length;
      score = Math.round(cueAccuracy * 100);
      isCorrect = score >= 80;
    }

    const scenarioAttempt = await this.prisma.scenarioAttempt.create({
      data: {
        moduleResultId: moduleResults.id,
        scenarioId: dto.scenarioId,
        moduleId: scenario.moduleId,
        attemptNumber: dto.attemptNumber,
        response: dto.response,
        isCorrect,
        score,
        timeTakenSeconds: dto.timeTakenSeconds,
        startedAt: new Date(dto.startedAt),
        completedAt: new Date(dto.completedAt),
        cueSelections: selectedCues as unknown as Prisma.InputJsonValue,
        missedCues: missedCues as unknown as Prisma.InputJsonValue,
      },
    });

    await this.recalculateModuleResults(moduleResults.id);

    //Feedback enging: predefined feedback for correct/incorrect answers,
    //also explains scenario's correct answer and why.
    return {
      attemptId: scenarioAttempt.id,
      scenarioId: scenarioAttempt.scenarioId,
      moduleId: scenarioAttempt.moduleId,
      attemptNumber: scenarioAttempt.attemptNumber,
      response: scenarioAttempt.response,
      isCorrect: scenarioAttempt.isCorrect,
      timeTakenSeconds: scenarioAttempt.timeTakenSeconds,
      score: scenarioAttempt.score,
      startedAt: scenarioAttempt.startedAt,
      completedAt: scenarioAttempt.completedAt,
      cueSelections: selectedCues,
      missedCues,
    };
  }
  //Recomputes the parent ModuleResults row after every scenario submission
  private async recalculateModuleResults(moduleResultId: number) {
    const moduleResult = await this.prisma.moduleResults.findUnique({
      where: { id: moduleResultId },
      include: { scenarioAttempts: true },
    });
    if (!moduleResult) return;

    const totalScenarios = await this.prisma.scenario.count({
      where: { moduleId: moduleResult.moduleId },
    });

    //Only count a learner's most recent attempt for each scenario
    const latestByScenario = new Map<number, (typeof moduleResult.scenarioAttempts)[number]>();
    for (const attempt of moduleResult.scenarioAttempts) {
      const existing = latestByScenario.get(attempt.scenarioId);
      if (!existing || attempt.attemptNumber > existing.attemptNumber) {
        latestByScenario.set(attempt.scenarioId, attempt);
      }
    }
    const latestAttempts = Array.from(latestByScenario.values());

    const scenariosCompleted = latestAttempts.length;
    const totalScore = latestAttempts.reduce((sum, a) => sum + a.score, 0);
    const percentageScore = scenariosCompleted === 0 ? 0 : Math.round(totalScore / scenariosCompleted);
    const isComplete = totalScenarios > 0 && scenariosCompleted >= totalScenarios;

    await this.prisma.moduleResults.update({
      where: { id: moduleResultId },
      data: {
        total_score: totalScore,
        max_possible_score: percentageScore,
        percentage_score: percentageScore,
        scenarios_completed: scenariosCompleted,
        total_scenarios: totalScenarios,
        passed: percentageScore >= 80,
        status: isComplete ? Status.COMPLETED : Status.IN_PROGRESS,
        completedAt: isComplete ? new Date() : moduleResult.completedAt,
      },
    })
  }

  //Results Summary for one attempt and all answers submitted for each scenario
  async findOne(
    attemptId: number,
    userId: number,
    isTrainer: boolean,
    organisationId: number,
  ) {
    const attempt = await this.prisma.moduleResults.findUnique({
      where: { id: attemptId },
      include: {
        scenarioAttempts: true,
        user: {
          select: {
            organisationId: true,
          },
        },
      },
    });
    if (!attempt) {
      throw new NotFoundException(
        `Your attempt was not found for ${attemptId}`,
      );
    }
    if (!isTrainer && attempt.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to view this attempt`,
      );
    }
    if (isTrainer && attempt.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You are not authorised, this ateempt belongs to another organisation',
      );
    }
    return attempt;
  }

  //List learner's scenario attempt for a single module
  async findAttemptsForModule(
    requestingUserId: number,
    requestingUserRole: string,
    moduleId: number,
    queryUserId?: number,
  ) {
    const isTrainerOrAdmin =
      requestingUserRole === 'TRAINER' || requestingUserRole === 'GLOBAL_ADMIN';

    let targetUserId: number;
    if (isTrainerOrAdmin) {
      if (!queryUserId) {
        throw new BadRequestException(
          'userId is required when viewing attempts as a trainer or global admin',
        );
      }
      targetUserId = queryUserId;
    } else {
      targetUserId = requestingUserId;
    }

    const scenarioAttempts = await this.prisma.scenarioAttempt.findMany({
      where: {
        moduleId,
        moduleResult: { userId: targetUserId },
      },
      orderBy: { completedAt: 'asc' },
    });

    return {
      attempts: scenarioAttempts.map((a) => ({
        attemptId: a.id,
        scenarioId: a.scenarioId,
        isCorrect: a.isCorrect,
        score: a.score,
        completedAt: a.completedAt,
      })),
    };
  }

  //Fetch an attempt and confirm it belongs to the user making the request
  private async ensureOwnedByUser(attemptId: number, userId: number) {
    const attempt = await this.prisma.moduleResults.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) {
      throw new NotFoundException(
        `Your attempt was not found for ${attemptId}`,
      );
    }
    if (attempt.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to view this attempt`,
      );
    }
    return attempt;
  }
}
