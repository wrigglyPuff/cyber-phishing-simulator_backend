import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  //Completed module, results row stored
  async finalizeAttempt(attemptId: number, userId: number) {
    const attempt = await this.prisma.moduleResults.findUnique({
      where: { id: attemptId },
      include: { scenarioAttempts: true },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access tothis attempt');
    }

    if (attempt.scenarioAttempts.length === 0) {
      throw new BadRequestException(
        'This attempt has no answered scenarios yet',
      );
    }

    const totalScore = attempt.scenarioAttempts.filter(
      (sa) => sa.isCorrect,
    ).length;
    const scenariosTotal = attempt.scenarioAttempts.length;
    const percentageScore = Math.round((totalScore / scenariosTotal) * 100);

    return this.prisma.moduleResults.update({
      where: { id: attemptId },
      data: {
        total_score: totalScore,
        max_possible_score: scenariosTotal,
        percentage_score: percentageScore,
        scenarios_completed: scenariosTotal,
        total_scenarios: scenariosTotal,
        passed: percentageScore >= 80,
        status: Status.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  //Learner's own summary, trainer can lookup specific learners
  //can filter to one module and per scenario detail
  private async buildSummary(userId: number, moduleId?: number) {
    const moduleResults = await this.prisma.moduleResults.findMany({
      where: {
        userId,
        ...(moduleId ? { moduleId } : {}),
      },
      include: { module: { select: { id: true, title: true } } },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const scenarioResults = await this.prisma.scenarioAttempt.findMany({
      where: {
        moduleResult: {
          userId,
          ...(moduleId ? { moduleId } : {}),
        },
      },
      include: {
        scenario: { select: { id: true, title: true, moduleId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { moduleResults, scenarioResults };
  }

  //Learner own score + summary, each scenario per module,
  //can filter to one module
  async getMySummary(userId: number, moduleId?: number) {
    return this.buildSummary(userId, moduleId);
  }

  //Look up learner by Id, check organisation
  async getLearnerSummary(
    learnerId: number,
    requestingOrgId: number,
    moduleId?: number,
  ) {
    const learner = await this.prisma.user.findUnique({
      where: { id: learnerId },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    if (learner.organisationId !== requestingOrgId) {
      throw new ForbiddenException('That learner is not in your organisation');
    }
    return this.buildSummary(learnerId, moduleId);
  }

  //Trainer view of all learner's results for a module.
  //Restricted to own organisation only,
  //siple aggregare stats (total attempts, average score etc)
  async getModuleResults(moduleId: number, organisationId: number) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const results = await this.prisma.moduleResults.findMany({
      where: {
        moduleId,
        organisationId,
      },
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const completions = results.length;
    const averageScorePercent =
      completions === 0
        ? 0
        : Math.round(
            results.reduce((sum, r) => sum + r.percentage_score, 0) /
              completions,
          );

    return {
      moduleId,
      completions,
      averageScorePercent,
      results,
    };
  }
}
