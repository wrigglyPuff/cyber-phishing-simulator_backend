import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ResultsService {
    constructor(private prisma: PrismaService) { }

    //Completed module, results row stored
    async finalizeAttempt(attemptId: number, userId: number) {
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId },
            include: { scenarioAttempts: true }
        });

        if (!attempt) {
            throw new NotFoundException('Attempt not found');
        }

        if (attempt.userId !== userId) {
            throw new ForbiddenException('You do not have access tothis attempt');
        }

        if (attempt.scenarioAttempts.length === 0) {
            throw new BadRequestException('This attempt has no answered scenarios yet');
        }

        const score = attempt.scenarioAttempts.filter(sa => sa.isCorrect).length;
        const scenariosTotal = attempt.scenarioAttempts.length;

        return this.prisma.results.create({
            data: {
                userId: attempt.userId,
                moduleId: attempt.moduleId,
                score,
                scenariosTotal,
            }
        });
    }

    //Learner's own summary, can filter to one module
    async getMyResults(userId: number, moduleId?: number) {
        return this.prisma.results.findMany({
            where: {
                userId,
                ...(moduleId ? { moduleId } : {})
            },
            orderBy: {
                completedAt: 'desc'
            }
        });
    }
    //Trainer view of all learners' results, can filter to one module,
    //and simple aggregate stats (average score, total attempts, etc.)
    async getModuleResults(moduleId: number) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
        });

        if (!module) {
            throw new NotFoundException('Module not found');
        }

        const results = await this.prisma.results.findMany({
            where: { moduleId },
            include: { User: { select: { id: true, username: true, email: true } } },
            orderBy: { completedAt: 'desc' }
        });

        const completions = results.length;
        const averageScorePercent = completions === 0 ? 0
            : Math.round((results.reduce((sum, r) => sum + r.score / r.scenariosTotal, 0) / completions) * 100
            );
        return {
            moduleId,
            completions,
            averageScorePercent,
            results
        };
    }
}
