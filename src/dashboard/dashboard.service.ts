import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, Status } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    private ensureOwnOrganisation(
        orgId: number,
        requestingOrgId: number,
        requestingUserRole: string,
    ) {
        if (requestingUserRole === Role.GLOBAL_ADMIN) {
            return;
        }
        if (orgId !== requestingOrgId) {
            throw new ForbiddenException(
                'You do not have permission to view this organisation',
            );
        }
    }

    private readAssignedUsers(value: unknown): number[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item): item is number => typeof item === 'number');
    }

    private roundToOneDecimal(value: number): number {
        return Math.round(value * 10) / 10;
    }

    async getOverview(
        orgId: number,
        requestingOrgId: number,
        requestingUserRole: string,
    ) {
        this.ensureOwnOrganisation(orgId, requestingOrgId, requestingUserRole);

        const totalLearners = await this.prisma.user.count({
            where: { organisationId: orgId, role: Role.LEARNER },
        });

        const modules = await this.prisma.module.findMany({
            where: { organisationId: orgId },
            select: { id: true, assignedUsers: true },
        });

        let activeModules = 0;
        let totalAssignments = 0;

        for (const module of modules) {
            const assigned = this.readAssignedUsers(module.assignedUsers);
            if (assigned.length > 0) {
                activeModules++;
            }
            totalAssignments += assigned.length;
        }

        const completedResults = await this.prisma.moduleResults.findMany({
            where: { organisationId: orgId, status: Status.COMPLETED },
            select: { percentage_score: true },
        });

        const completedCount = completedResults.length;

        const overallCompletionRate =
            totalAssignments === 0
                ? 0
                : this.roundToOneDecimal((completedCount / totalAssignments) * 100);

        const averageScore =
            completedCount === 0
                ? 0
                : this.roundToOneDecimal(
                    completedResults.reduce(
                        (sum, result) => sum + result.percentage_score,
                        0,
                    ) / completedCount,
                );

        return {
            totalLearners,
            activeModules,
            overallCompletionRate,
            averageScore,
        };
    }

    private describeAction(status: Status): string {
        if (status === Status.COMPLETED) {
            return 'completed';
        }
        if (status === Status.IN_PROGRESS) {
            return 'started';
        }
        return 'assigned';
    }

    async getActivity(
        orgId: number,
        requestingOrgId: number,
        requestingUserRole: string,
    ) {
        this.ensureOwnOrganisation(orgId, requestingOrgId, requestingUserRole);

        const rows = await this.prisma.moduleResults.findMany({
            where: { organisationId: orgId },
            include: {
                user: {
                    select: { id: true, username: true, firstName: true, lastName: true },
                },
                module: { select: { id: true, title: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
        });

        const activity = rows.map((row) => ({
            userId: row.user.id,
            username: row.user.username,
            firstName: row.user.firstName,
            lastName: row.user.lastName,
            moduleId: row.module.id,
            moduleTitle: row.module.title,
            action: this.describeAction(row.status),
            timestamp: row.completedAt ?? row.startedAt ?? row.updatedAt,
        }));

        return { activity };
    }
}