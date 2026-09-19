import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    //COMPLETED beats IN_PROGRESS beats NOT_STARTED
    private statusRank(status: Status): number {
        if (status === Status.COMPLETED) {
            return 2;
        }
        if (status === Status.IN_PROGRESS) {
            return 1;
        }
        return 0;
    }

    //Rebuilds this learner's Analytics row for one module from scratch.
    //It always recalculates from every ModuleResults row rather than adding to
    //a running total, so the summary can never drift away from the real data
    async refreshForUserModule(userId: number, moduleId: number) {
        const results = await this.prisma.moduleResults.findMany({
            where: { userId, moduleId },
            orderBy: { id: 'asc' },
            select: {
                organisationId: true,
                status: true,
                percentage_score: true,
                scenarios_completed: true,
                total_scenarios: true,
                passed: true,
                completedAt: true,
            },
        });

        if (results.length === 0) {
            return;
        }

        const latestRow = results[results.length - 1];

        //Only finished attempts have a score worth comparing
        const completed = results.filter((r) => r.status === Status.COMPLETED);
        const firstCompleted = completed.length > 0 ? completed[0] : null;
        const latestCompleted =
            completed.length > 0 ? completed[completed.length - 1] : null;

        const firstAttemptScore = firstCompleted
            ? firstCompleted.percentage_score
            : null;
        const latestAttemptScore = latestCompleted
            ? latestCompleted.percentage_score
            : null;

        const improvementPoints =   //stays null until learner has completed module twice
            completed.length > 1 &&
                firstAttemptScore !== null &&
                latestAttemptScore !== null
                ? latestAttemptScore - firstAttemptScore
                : null;

        const bestAttemptScore =
            completed.length === 0
                ? null
                : Math.max(...completed.map((r) => r.percentage_score));

        //The furthest they have ever got with this module
        let bestStatus: Status = Status.NOT_STARTED;
        for (const result of results) {
            if (this.statusRank(result.status) > this.statusRank(bestStatus)) {
                bestStatus = result.status;
            }
        }

        const data = {
            organisationId: latestRow.organisationId,
            attemptsCount: results.length,
            firstAttemptScore,
            firstCompletedAt: firstCompleted ? firstCompleted.completedAt : null,
            latestAttemptScore,
            latestCompletedAt: latestCompleted ? latestCompleted.completedAt : null,
            bestAttemptScore,
            improvementPoints,
            status: bestStatus,
            scenarios_completed: latestRow.scenarios_completed,
            total_scenarios: latestRow.total_scenarios,
            passed: completed.some((r) => r.passed),
        };

        await this.prisma.analytics.upsert({
            where: { userId_moduleId: { userId, moduleId } },
            create: { userId, moduleId, ...data },
            update: data,
        });
    }
}