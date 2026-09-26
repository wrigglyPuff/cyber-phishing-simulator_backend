import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { assertOrganisationAccess } from '../common/organisation-access';

@Injectable()
export class OrganisationsService {
    constructor(private prisma: PrismaService) { }

    //Counts are read live from the users table, never stored
    private async countMembers(organisationId: number) {
        const learnerCount = await this.prisma.user.count({
            where: { organisationId, role: Role.LEARNER },
        });
        const trainerCount = await this.prisma.user.count({
            where: { organisationId, role: Role.TRAINER },
        });
        return { learnerCount, trainerCount };
    }

    async create(createOrganisationDto: CreateOrganisationDto) {
        const existing = await this.prisma.organisation.findUnique({
            where: { name: createOrganisationDto.name },
        });
        if (existing) {
            throw new ConflictException(
                `An organisation called "${createOrganisationDto.name}" already exists`,
            );
        }

        const organisation = await this.prisma.organisation.create({
            data: { name: createOrganisationDto.name },
        });

        return {
            id: organisation.id,
            name: organisation.name,
        };
    }

    //Every organisation with live member/module counts (global admin only)
    async findAll() {
        const organisations = await this.prisma.organisation.findMany({
            orderBy: { name: 'asc' },
        });

        const [userCounts, moduleCounts] = await Promise.all([
            this.prisma.user.groupBy({
                by: ['organisationId', 'role'],
                where: { role: { in: [Role.LEARNER, Role.TRAINER] } },
                _count: { _all: true },
            }),
            this.prisma.module.groupBy({
                by: ['organisationId'],
                _count: { _all: true },
            }),
        ]);

        return organisations.map((organisation) => {
            const countFor = (role: Role) =>
                userCounts.find(
                    (row) => row.organisationId === organisation.id && row.role === role,
                )?._count._all ?? 0;

            return {
                id: organisation.id,
                name: organisation.name,
                learnerCount: countFor(Role.LEARNER),
                trainerCount: countFor(Role.TRAINER),
                moduleCount:
                    moduleCounts.find((row) => row.organisationId === organisation.id)
                        ?._count._all ?? 0,
                createdAt: organisation.createdAt,
                updatedAt: organisation.updatedAt,
            };
        });
    }

    async findOne(
        id: number,
        requester: { role: string; organisationId: number | null },
    ) {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
        });
        if (!organisation) {
            throw new NotFoundException(`Organisation ${id} not found`);
        }

        //Checks if user has permission to access organisation
        assertOrganisationAccess(organisation.id, requester);

        const counts = await this.countMembers(organisation.id);

        return {
            id: organisation.id,
            name: organisation.name,
            learnerCount: counts.learnerCount,
            trainerCount: counts.trainerCount,
        };
    }

    async update(
        id: number,
        updateOrganisationDto: UpdateOrganisationDto,
        requester: { role: string; organisationId: number | null },
    ) {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
        });
        if (!organisation) {
            throw new NotFoundException(`Organisation ${id} not found`);
        }

        //Checks if user has permission to access organisation
        assertOrganisationAccess(organisation.id, requester);

        if (updateOrganisationDto.name !== undefined) {
            const clash = await this.prisma.organisation.findUnique({
                where: { name: updateOrganisationDto.name },
            });
            if (clash && clash.id !== id) {
                throw new ConflictException(
                    `An organisation called "${updateOrganisationDto.name}" already exists`,
                );
            }
        }

        const updated = await this.prisma.organisation.update({
            where: { id },
            data: updateOrganisationDto,
        });

        const counts = await this.countMembers(updated.id);

        return {
            id: updated.id,
            name: updated.name,
            learnerCount: counts.learnerCount,
            trainerCount: counts.trainerCount,
            updatedAt: updated.updatedAt,
        };
    }

    async remove(id: number) {
        const organisation = await this.prisma.organisation.findUnique({
            where: { id },
        });
        if (!organisation) {
            throw new NotFoundException(`Organisation ${id} not found`);
        }

        const userCount = await this.prisma.user.count({
            where: { organisationId: id },
        });
        const moduleCount = await this.prisma.module.count({
            where: { organisationId: id },
        });

        if (userCount > 0 || moduleCount > 0) {
            throw new ConflictException(
                `Cannot delete organisation ${id}: it still has users: ${userCount} and the following modules: ${moduleCount}. Move or delete those first.`,
            );
        }

        await this.prisma.organisation.delete({ where: { id } });

        return { message: 'Organisation has been successfully deleted' };
    }
}