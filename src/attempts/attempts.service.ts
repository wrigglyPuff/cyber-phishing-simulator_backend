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
import { CreateChoiceScenarioDto } from '../scenarios/dto/create-choice-scenario.dto';
import { CreateChoiceScenarioCueDto } from '../scenarios/dto/create-scenario-cue.dto';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

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
        `Scenario and ID combination ${dto.scenarioId}not found`,
      );
    }

    const choices = scenario.choices as unknown as CreateChoiceScenarioDto[];
    const choice = choices[dto.choiceId];
    if (!choice) {
      throw new BadRequestException(
        `Choice index ${dto.choiceId} does not exist on this ecenario`,
      );
    }
    const cues = (scenario.cues ??
      []) as unknown as CreateChoiceScenarioCueDto[];
    const realCueIndexes = cues
      .map((cue, index) => ({ cue, index }))
      .filter(({ cue }) => cue.isCorrect)
      .map(({ index }) => index);
    const selectedCueIndexes = dto.selectedCueIndexes ?? [];
    const missedCueIndexes = realCueIndexes.filter(
      (index) => !selectedCueIndexes.includes(index),
    );
    const missedCues = missedCueIndexes.map((index) => cues[index]);

    const scenarioAttempt = await this.prisma.scenarioAttempt.create({
      data: {
        moduleResultId: moduleResults.id,
        scenarioId: dto.scenarioId,
        moduleId: scenario.moduleId,
        selectedChoice: dto.choiceId,
        selectedChoiceText: choice.text,
        isCorrect: choice.isCorrect,
        timeTakenSeconds: dto.timeTakenSeconds ?? 0,
        cueSelections: selectedCueIndexes as unknown as Prisma.InputJsonValue,
        missedCues: missedCues as unknown as Prisma.InputJsonValue,
      },
    });

    //Feedback enging: predefined feedback for correct/incorrect answers,
    //also explains scenario's correct answer and why.
    return {
      ...scenarioAttempt,
      feedback: {
        message: choice.feedback,
        correctActionExplained: scenario.correctActionExplanation,
        missedCues,
      },
    };
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
