import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, Status } from '@prisma/client';
import { assertOrganisationAccess } from '../common/organisation-access';

//Built by JwtStrategy.validate(), req.user shape
type Requester = {
    userId: number;
    role: string;
    organisationId: number | null;
};

type DateRange = { gte?: Date; lte?: Date };

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly statusMap: Record<Status, 'notStarted' | 'inProgress' | 'completed'> = {
        [Status.NOT_STARTED]: 'notStarted',
        [Status.IN_PROGRESS]: 'inProgress',
        [Status.COMPLETED]: 'completed',
    };

    //assignedUsers is a Json column, this always hands back a safe number[]
    private readAssignedUsers(value: unknown): number[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item): item is number => typeof item === 'number');
    }

    private roundToOneDecimal(value: number): number {
        return Math.round(value * 10) / 10;
    }

    //COMPLETED > IN_PROGRESS > NOT_STARTED. Used whenever learner does a retake
    private statusRank(status: Status): number {
        if (status === Status.COMPLETED) {
            return 2;
        }
        if (status === Status.IN_PROGRESS) {
            return 1;
        }
        return 0;
    }

    //Every report accepts ?startDate=&endDate= and filters on ModuleResults.updatedAt
    private parseDateRange(startDate?: string, endDate?: string): DateRange {
        const range: DateRange = {};
        if (startDate !== undefined) {
            const parsed = new Date(startDate);
            if (isNaN(parsed.getTime())) {
                throw new BadRequestException(`Invalid startDate: ${startDate}`);
            }
            range.gte = parsed;
        }
        if (endDate !== undefined) {
            const parsed = new Date(endDate);
            if (isNaN(parsed.getTime())) {
                throw new BadRequestException(`Invalid endDate: ${endDate}`);
            }
            range.lte = parsed;
        }
        return range;
    }

    private dateFilter(range: DateRange): { updatedAt?: DateRange } {
        return Object.keys(range).length > 0 ? { updatedAt: range } : {};
    }

    async getOverview(
        orgId: number,
        requester: Requester,
        startDate?: string,
        endDate?: string,
    ) {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );
        const range = this.parseDateRange(startDate, endDate);

        const totalUsers = await this.prisma.user.count({
            where: { organisationId: orgId, role: Role.LEARNER },
        });

        const modules = await this.prisma.module.findMany({
            where: { organisationId: orgId },
            select: { assignedUsers: true },
        });

        let modulesAssignedCount = 0;
        let totalAssignments = 0;
        for (const module of modules) {
            const assigned = this.readAssignedUsers(module.assignedUsers);
            if (assigned.length > 0) {
                modulesAssignedCount++;
            }
            totalAssignments += assigned.length;
        }

        const completedResults = await this.prisma.moduleResults.findMany({
            where: {
                organisationId: orgId,
                status: Status.COMPLETED,
                ...this.dateFilter(range),
            },
            select: { percentage_score: true },
        });

        const completionRate =
            totalAssignments === 0
                ? 0
                : this.roundToOneDecimal(
                    (completedResults.length / totalAssignments) * 100,
                );

        const averageScore =
            completedResults.length === 0
                ? 0
                : this.roundToOneDecimal(
                    completedResults.reduce((sum, r) => sum + r.percentage_score, 0) /
                    completedResults.length,
                );

        return { totalUsers, modulesAssignedCount, completionRate, averageScore };
    }

    //Per-module completion/score/pass rates
    async getModulesBreakdown(
        orgId: number,
        requester: Requester,
        startDate?: string,
        endDate?: string,
    ) {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );
        const range = this.parseDateRange(startDate, endDate);

        const modules = await this.prisma.module.findMany({
            where: { organisationId: orgId },
            select: { id: true, title: true, assignedUsers: true },
        });

        const results = await this.prisma.moduleResults.findMany({
            where: { organisationId: orgId, ...this.dateFilter(range) },
            select: {
                moduleId: true,
                status: true,
                percentage_score: true,
                passed: true,
            },
        });

        const resultsByModule = new Map<number, typeof results>();
        for (const result of results) {
            if (!resultsByModule.has(result.moduleId)) {
                resultsByModule.set(result.moduleId, []);
            }
            resultsByModule.get(result.moduleId)!.push(result);
        }

        const moduleItems = modules.map((module) => {
            const moduleResults = resultsByModule.get(module.id) ?? [];
            const assignedCount = this.readAssignedUsers(module.assignedUsers).length;
            const completed = moduleResults.filter(
                (r) => r.status === Status.COMPLETED,
            );

            const completionRate =
                assignedCount === 0
                    ? 0
                    : this.roundToOneDecimal((completed.length / assignedCount) * 100);
            const averageScore =
                completed.length === 0
                    ? 0
                    : this.roundToOneDecimal(
                        completed.reduce((sum, r) => sum + r.percentage_score, 0) /
                        completed.length,
                    );
            const passRate =
                completed.length === 0
                    ? 0
                    : this.roundToOneDecimal(
                        (completed.filter((r) => r.passed).length / completed.length) *
                        100,
                    );

            return {
                moduleId: module.id,
                title: module.title,
                completionRate,
                averageScore,
                passRate,
            };
        });

        return { modules: moduleItems };
    }

    //Score distribution + status breakdown for one module
    async getModuleDetail(
        orgId: number,
        moduleId: number,
        requester: Requester,
        startDate?: string,
        endDate?: string,
    ) {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );

        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            select: {
                id: true,
                title: true,
                organisationId: true,
                assignedUsers: true,
            },
        });
        if (!module) {
            throw new NotFoundException(`Module ${moduleId} not found`);
        }
        if (module.organisationId !== orgId) {
            throw new NotFoundException(
                `Module ${moduleId} does not belong to organisation ${orgId}`,
            );
        }

        const range = this.parseDateRange(startDate, endDate);
        const assignedUserIds = this.readAssignedUsers(module.assignedUsers);

        const results = await this.prisma.moduleResults.findMany({
            where: { moduleId, ...this.dateFilter(range) },
            select: { userId: true, status: true, percentage_score: true },
        });

        const buckets: Record<'0-50' | '51-80' | '81-100', number> = {
            '0-50': 0,
            '51-80': 0,
            '81-100': 0,
        };
        for (const result of results) {
            if (result.status !== Status.COMPLETED) {
                continue;
            }
            if (result.percentage_score <= 50) {
                buckets['0-50']++;
            } else if (result.percentage_score <= 80) {
                buckets['51-80']++;
            } else {
                buckets['81-100']++;
            }
        }
        const scoreDistribution = Object.entries(buckets).map(
            ([bucketRange, count]) => ({ range: bucketRange, count }),
        );

        //Best status this learner reached within the date window
        const bestStatusByUser = new Map<number, Status>();
        for (const result of results) {
            const current = bestStatusByUser.get(result.userId);
            if (
                !current ||
                this.statusRank(result.status) > this.statusRank(current)
            ) {
                bestStatusByUser.set(result.userId, result.status);
            }
        }

        let notStarted = 0;
        let inProgress = 0;
        let completed = 0;
        for (const userId of assignedUserIds) {
            const status = bestStatusByUser.get(userId);
            if (status === Status.COMPLETED) {
                completed++;
            } else if (status === Status.IN_PROGRESS) {
                inProgress++;
            } else {
                notStarted++;
            }
        }

        return {
            moduleId: module.id,
            title: module.title,
            scoreDistribution,
            statusBreakdown: { notStarted, inProgress, completed },
        };
    }


    private matchesStatusFilter(
        results: { status: Status }[],
        statusFilter: string,
    ): boolean {
        const hasCompleted = results.some((r) => r.status === Status.COMPLETED);
        const hasInProgress = results.some((r) => r.status === Status.IN_PROGRESS);
        if (statusFilter === 'completed') {
            return hasCompleted;
        }
        if (statusFilter === 'inProgress') {
            return hasInProgress && !hasCompleted;
        }
        if (statusFilter === 'notStarted') {
            return !hasCompleted && !hasInProgress;
        }
        throw new BadRequestException(
            `Unknown status filter: ${statusFilter}. Use notStarted, inProgress or completed.`,
        );
    }

    //Per-learner completion/score/at-risk flags
    async getUsersBreakdown(
        orgId: number,
        requester: Requester,
        startDate?: string,
        endDate?: string,
        statusFilter?: string,
    ) {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );
        const range = this.parseDateRange(startDate, endDate);

        //same "weak" threshold used for learner analytics in users.service.ts
        const AT_RISK_SCORE_THRESHOLD = 70;

        const learners = await this.prisma.user.findMany({
            where: { organisationId: orgId, role: Role.LEARNER },
            select: { id: true, username: true },
        });

        const modules = await this.prisma.module.findMany({
            where: { organisationId: orgId },
            select: { assignedUsers: true },
        });
        const assignedCountByUser = new Map<number, number>();
        for (const module of modules) {
            for (const userId of this.readAssignedUsers(module.assignedUsers)) {
                assignedCountByUser.set(
                    userId,
                    (assignedCountByUser.get(userId) ?? 0) + 1,
                );
            }
        }

        const results = await this.prisma.moduleResults.findMany({
            where: { organisationId: orgId, ...this.dateFilter(range) },
            select: { userId: true, status: true, percentage_score: true },
        });
        const resultsByUser = new Map<number, typeof results>();
        for (const result of results) {
            if (!resultsByUser.has(result.userId)) {
                resultsByUser.set(result.userId, []);
            }
            resultsByUser.get(result.userId)!.push(result);
        }

        const enriched = learners.map((learner) => ({
            learner,
            userResults: resultsByUser.get(learner.id) ?? [],
            assignedCount: assignedCountByUser.get(learner.id) ?? 0,
        }));

        const filtered = statusFilter
            ? enriched.filter(({ userResults }) =>
                this.matchesStatusFilter(userResults, statusFilter),
            )
            : enriched;

        const users = filtered.map(({ learner, userResults, assignedCount }) => {
            const completed = userResults.filter(
                (r) => r.status === Status.COMPLETED,
            );
            const completionRate =
                assignedCount === 0
                    ? 0
                    : this.roundToOneDecimal((completed.length / assignedCount) * 100);
            const averageScore =
                completed.length === 0
                    ? 0
                    : this.roundToOneDecimal(
                        completed.reduce((sum, r) => sum + r.percentage_score, 0) /
                        completed.length,
                    );
            const atRisk =
                completed.length > 0 && averageScore < AT_RISK_SCORE_THRESHOLD;

            return {
                userId: learner.id,
                username: learner.username,
                completionRate,
                averageScore,
                atRisk,
            };
        });

        return { users };
    }

    //One learner's per-module scores and status
    async getUserDetail(orgId: number, userId: number, requester: Requester) {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, organisationId: true },
        });
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }
        if (user.organisationId !== orgId) {
            throw new NotFoundException(
                `User ${userId} is not in organisation ${orgId}`,
            );
        }

        const modules = await this.prisma.module.findMany({
            where: { assignedUsers: { array_contains: userId } },
            select: { id: true, title: true },
        });

        const results = await this.prisma.moduleResults.findMany({
            where: { userId, moduleId: { in: modules.map((m) => m.id) } },
            select: { moduleId: true, status: true, percentage_score: true },
        });

        const bestResultByModule = new Map<number, (typeof results)[number]>();
        for (const result of results) {
            const current = bestResultByModule.get(result.moduleId);
            if (
                !current ||
                this.statusRank(result.status) > this.statusRank(current.status)
            ) {
                bestResultByModule.set(result.moduleId, result);
            }
        }

        const modulesOut = modules.map((module) => {
            const result = bestResultByModule.get(module.id);
            return {
                moduleId: module.id,
                title: module.title,
                percentageScore: result?.percentage_score ?? 0,
                status: this.statusMap[result?.status ?? Status.NOT_STARTED],
            };
        });

        return { userId: user.id, username: user.username, modules: modulesOut };
    }

    //Turns a flat list of same-shaped objects into a CSV string.
    private toCsv(columns: string[], rows: Record<string, unknown>[]): string {
        const escape = (value: unknown): string => {
            const text =
                value === null || value === undefined
                    ? ''
                    : typeof value === 'number' || typeof value === 'boolean'
                        ? String(value)
                        : `${value as string}`;
            return `"${text.replace(/"/g, '""')}"`;
        };
        const header = columns.map(escape).join(',');
        const lines = rows.map((row) =>
            columns.map((column) => escape(row[column])).join(','),
        );
        return [header, ...lines].join('\n');
    }

    //Formats getOverview/getModulesBreakdown result as a CSV
    async getExportCsv(
        orgId: number,
        requester: Requester,
        startDate?: string,
        endDate?: string,
        moduleId?: number,
    ): Promise<string> {
        assertOrganisationAccess(
            orgId,
            requester,
            'You do not have permission to view this organisation',
        );

        if (moduleId !== undefined) {
            const breakdown = await this.getModulesBreakdown(
                orgId,
                requester,
                startDate,
                endDate,
            );
            const single = breakdown.modules.find((m) => m.moduleId === moduleId);
            if (!single) {
                throw new NotFoundException(
                    `Module ${moduleId} not found in this organisation's report`,
                );
            }
            return this.toCsv(
                ['moduleId', 'title', 'completionRate', 'averageScore', 'passRate'],
                [single],
            );
        }

        const overview = await this.getOverview(
            orgId,
            requester,
            startDate,
            endDate,
        );
        const breakdown = await this.getModulesBreakdown(
            orgId,
            requester,
            startDate,
            endDate,
        );

        const overviewCsv = this.toCsv(
            ['totalUsers', 'modulesAssignedCount', 'completionRate', 'averageScore'],
            [overview],
        );
        const modulesCsv = this.toCsv(
            ['moduleId', 'title', 'completionRate', 'averageScore', 'passRate'],
            breakdown.modules,
        );

        return `${overviewCsv}\n\n${modulesCsv}`;
    }
}