import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';
import { assertOrganisationAccess } from '../common/organisation-access';

export type RequestUser = {
  userId: number;
  role: string;
  organisationId: number | null;
};

type ModuleForRead = {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  organisationId: number;
  assignedUsers: unknown;
  organisation: { name: string } | null;
  createdBy: { firstName: string, lastName: string } | null;
  scenarios: { id: number; title: string; scenarioDescription: string }[];
};

type UserSummary = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
};

@Injectable()
export class TrainingModulesService {
  constructor(private prisma: PrismaService) { }

  //Trainers create a new module
  async create(
    createTrainingModuleDto: CreateTrainingModuleDto,
    requester: RequestUser,
  ) {
    const organisationId = requester.organisationId;
    if (organisationId === null) {
      throw new BadRequestException(
        'Your account is not linked to an organisation, so it cannot create a module',
      );
    }

    const isGlobalAdmin = requester.role === Role.GLOBAL_ADMIN;
    const scenarioIds = createTrainingModuleDto.scenarios ?? [];
    const assignedUserIds = createTrainingModuleDto.assignedUsers ?? [];

    await this.validateScenarioIds(scenarioIds, organisationId, isGlobalAdmin);
    await this.validateAssignedUserIds(
      assignedUserIds,
      organisationId,
      isGlobalAdmin,
    );

    const created = await this.prisma.module.create({
      data: {
        title: createTrainingModuleDto.title,
        description: createTrainingModuleDto.description,
        organisationId,
        createdById: requester.userId,
        assignedUsers: assignedUserIds,
        scenarios: { connect: scenarioIds.map((id) => ({ id })) },
      },
    });

    return this.findOne(created.id, requester);
  }

  //Global admins see every module, everyone else only sees their own org
  //assignedToMe further narrows the list to modules the caller is assigned to
  async findAll(requester: RequestUser, assignedToMe?: boolean) {
    const isGlobalAdmin = requester.role === Role.GLOBAL_ADMIN;

    let where: {
      organisationId?: number;
      assignedUsers?: { array_contains: number };
    } = {};
    if (!isGlobalAdmin) {
      if (requester.organisationId === null) {
        throw new ForbiddenException(
          'Your account is not linked to an organisation',
        );
      }
      where = { organisationId: requester.organisationId };
    }
    if (assignedToMe) {
      where = { ...where, assignedUsers: { array_contains: requester.userId } };
    }

    const modules = await this.prisma.module.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { organisation: true, createdBy: true, scenarios: true },
    });

    const allUserIds = modules.flatMap((module) =>
      this.readAssignedUsers(module.assignedUsers),
    );
    const userMap = await this.loadUserSummaries(allUserIds);

    return modules.map((module) =>
      this.buildReadView(module, isGlobalAdmin, userMap),
    );
  }

  //Single module in the shape the frontend expects
  async findOne(id: number, requester: RequestUser) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { organisation: true, createdBy: true, scenarios: true },
    });
    if (!module) {
      throw new NotFoundException(`Module ${id} not found`);
    }
    assertOrganisationAccess(
      module.organisationId,
      requester,
      'You do not have permission to access this module',
    );

    const userMap = await this.loadUserSummaries(
      this.readAssignedUsers(module.assignedUsers),
    );

    return this.buildReadView(
      module,
      requester.role === Role.GLOBAL_ADMIN,
      userMap,
    );
  }

  //PATCH, only title, description, scenarios and assignedUsers can change
  async update(
    id: number,
    updateTrainingModuleDto: UpdateTrainingModuleDto,
    requester: RequestUser,
  ) {
    const module = await this.loadModuleForRequester(id, requester);
    const isGlobalAdmin = requester.role === Role.GLOBAL_ADMIN;

    if (updateTrainingModuleDto.scenarios !== undefined) {
      await this.validateScenarioIds(
        updateTrainingModuleDto.scenarios,
        module.organisationId,
        isGlobalAdmin,
      );
    }
    if (updateTrainingModuleDto.assignedUsers !== undefined) {
      await this.validateAssignedUserIds(
        updateTrainingModuleDto.assignedUsers,
        module.organisationId,
        isGlobalAdmin,
      );
    }

    await this.prisma.module.update({
      where: { id },
      data: {
        ...(updateTrainingModuleDto.title !== undefined
          ? { title: updateTrainingModuleDto.title }
          : {}),
        ...(updateTrainingModuleDto.description !== undefined
          ? { description: updateTrainingModuleDto.description }
          : {}),
        ...(updateTrainingModuleDto.assignedUsers !== undefined
          ? { assignedUsers: updateTrainingModuleDto.assignedUsers }
          : {}),
        ...(updateTrainingModuleDto.scenarios !== undefined
          ? {
            scenarios: {
              connect: updateTrainingModuleDto.scenarios.map(
                (scenarioId) => ({ id: scenarioId }),
              ),
            },
          }
          : {}),
      },
    });

    return this.findOne(id, requester);
  }

  async remove(id: number, organisationId: number) {
    await this.loadModuleForOrganisation(id, organisationId);

    return this.prisma.module.delete({
      where: { id },
    });
  }


  //assignedUsers is a Json column, this always hands back a safe number[]
  private readAssignedUsers(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is number => typeof item === 'number');
  }

  //Turns one module row into the JSON shape the ticket asked for
  private buildReadView(
    module: ModuleForRead,
    isGlobalAdmin: boolean,
    userMap: Map<number, UserSummary>,
  ) {
    const assignedUserIds = this.readAssignedUsers(module.assignedUsers);

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      //organisationId is only exposed to a global admin
      ...(isGlobalAdmin ? { organisationId: module.organisationId } : {}),
      organisationName: module.organisation ? module.organisation.name : null,
      createdBy: module.createdBy
        ? `${module.createdBy.firstName} ${module.createdBy.lastName}`
        : null,
      createdOn: module.createdAt,
      scenarios: module.scenarios.map((scenario) => ({
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.scenarioDescription,
      })),
      assignedUsers: assignedUserIds
        .map((userId) => userMap.get(userId))
        .filter((user): user is UserSummary => user !== undefined)
        .map((user) => ({
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user.id,
          userName: user.username,
        })),
    };
  }

  //One database trip for every assigned user across every module
  private async loadUserSummaries(
    userIds: number[],
  ): Promise<Map<number, UserSummary>> {
    const map = new Map<number, UserSummary>();
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) {
      return map;
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, firstName: true, lastName: true, username: true },
    });
    for (const user of users) {
      map.set(user.id, user);
    }
    return map;
  }

  //Every scenario id must exist and sit in the caller's organisation
  private async validateScenarioIds(
    scenarioIds: number[],
    organisationId: number,
    isGlobalAdmin: boolean,
  ) {
    if (scenarioIds.length === 0) {
      return;
    }

    const scenarios = await this.prisma.scenario.findMany({
      where: { id: { in: scenarioIds } },
      include: { module: true },
    });

    const missing = scenarioIds.filter(
      (id) => !scenarios.some((scenario) => scenario.id === id),
    );
    if (missing.length > 0) {
      throw new NotFoundException(
        `Scenario(s) not found: ${missing.join(', ')}`,
      );
    }

    if (isGlobalAdmin) {
      return;
    }

    const wrongOrganisation = scenarios.filter(
      (scenario) => scenario.module.organisationId !== organisationId,
    );
    if (wrongOrganisation.length > 0) {
      throw new ForbiddenException(
        `Scenario(s) ${wrongOrganisation
          .map((scenario) => scenario.id)
          .join(', ')} belong to a different organisation`,
      );
    }
  }

  //Every user id must exist and sit in the caller's organisation
  private async validateAssignedUserIds(
    userIds: number[],
    organisationId: number,
    isGlobalAdmin: boolean,
  ) {
    if (userIds.length === 0) {
      return;
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, organisationId: true },
    });

    const missing = userIds.filter((id) => !users.some((u) => u.id === id));
    if (missing.length > 0) {
      throw new NotFoundException(`User(s) not found: ${missing.join(', ')}`);
    }

    if (isGlobalAdmin) {
      return;
    }

    const wrongOrganisation = users.filter(
      (user) => user.organisationId !== organisationId,
    );
    if (wrongOrganisation.length > 0) {
      throw new BadRequestException(
        `User(s) ${wrongOrganisation
          .map((user) => user.id)
          .join(', ')} belong to a different organisation`,
      );
    }
  }

  //404 if missing, 403 unless the caller is in the org (global admin passes)
  private async loadModuleForRequester(id: number, requester: RequestUser) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module ${id} not found`);
    }
    assertOrganisationAccess(
      module.organisationId,
      requester,
      'You do not have permission to change this module',
    );
    return module;
  }

  //Checks for both assign and unassign
  private async loadModuleForOrganisation(
    moduleId: number,
    organisationId: number,
  ) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!module) {
      throw new NotFoundException(`Module ${moduleId} not found`);
    }
    if (module.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You do not have permission to change this module',
      );
    }
    return module;
  }

  async assignUser(moduleId: number, userId: number, organisationId: number) {
    const module = await this.loadModuleForOrganisation(
      moduleId,
      organisationId,
    );

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    if (user.organisationId !== module.organisationId) {
      throw new BadRequestException(
        `User ${userId} belongs to a different organisation and cannot be assigned to this module`,
      );
    }

    const assignedUsers = this.readAssignedUsers(module.assignedUsers);

    //already assigned, hand back the current list
    if (assignedUsers.includes(userId)) {
      return { moduleId, assignedUsers };
    }

    const updatedAssignedUsers = [...assignedUsers, userId];

    await this.prisma.module.update({
      where: { id: moduleId },
      data: { assignedUsers: updatedAssignedUsers },
    });

    return { moduleId, assignedUsers: updatedAssignedUsers };
  }

  async unassignUser(moduleId: number, userId: number, organisationId: number) {
    const module = await this.loadModuleForOrganisation(
      moduleId,
      organisationId,
    );

    const assignedUsers = this.readAssignedUsers(module.assignedUsers);

    if (!assignedUsers.includes(userId)) {
      throw new NotFoundException(
        `User ${userId} is not assigned to module ${moduleId}`,
      );
    }

    const updatedAssignedUsers = assignedUsers.filter((id) => id !== userId);

    await this.prisma.module.update({
      where: { id: moduleId },
      data: { assignedUsers: updatedAssignedUsers },
    });

    return { message: 'User unassigned from module' };
  }
}
