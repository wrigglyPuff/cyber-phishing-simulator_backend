import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  //Completed module, results row stored
  async finalizeAttempt(attemptId: number, userId: number) {
    const attempt = await this.prisma.attempt.findUnique({
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

    const score = attempt.scenarioAttempts.filter((sa) => sa.isCorrect).length;
    const scenariosTotal = attempt.scenarioAttempts.length;

    return this.prisma.results.create({
      data: {
        userId: attempt.userId,
        moduleId: attempt.moduleId,
        score,
        scenariosTotal,
      },
    });
  }

  //Learner's own summary, trainer can lookup specific learners
  //can filter to one module and per scenario detail
  private async buildSummary(userId: number, moduleId?: number) {
    const results = await this.prisma.results.findMany({
      where: {
        userId,
        ...(moduleId ? { moduleId } : {}),
      },
      include: { Module: { select: { id: true, title: true } } },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const moduleResults = results.map((r) => ({
      ...r,
      scorePercent:
        r.scenariosTotal === 0
          ? 0
          : Math.round((r.score / r.scenariosTotal) * 100),
    }));

    const scenarioResults = await this.prisma.scenarioAttempt.findMany({
      where: {
        attempt: {
          userId,
          ...(moduleId ? { moduleId } : {}),
        },
      },
      include: {
        scenario: { select: { id: true, title: true, moduleId: true } },
        choice: { select: { id: true, text: true, isCorrect: true } },
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

    const results = await this.prisma.results.findMany({
      where: {
        moduleId,
        User: { organisationId },
      },
      include: { User: { select: { id: true, username: true, email: true } } },
      orderBy: { completedAt: 'desc' },
    });

    const completions = results.length;
    const averageScorePercent =
      completions === 0
        ? 0
        : Math.round(
            (results.reduce((sum, r) => sum + r.score / r.scenariosTotal, 0) /
              completions) *
              100,
          );
    return {
      moduleId,
      completions,
      averageScorePercent,
      results,
    };
  }
}
