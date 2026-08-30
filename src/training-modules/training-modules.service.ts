import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTrainingModuleDto } from './dto/create-training-module.dto';
import { UpdateTrainingModuleDto } from './dto/update-training-module.dto';

@Injectable()
export class TrainingModulesService {
  constructor(private prisma: PrismaService) { }

  //Trainers create a new module
  async create(
    createTrainingModuleDto: CreateTrainingModuleDto,
    organisationId: number,
  ) {
    return this.prisma.module.create({
      data: {
        ...createTrainingModuleDto,
        organisationId,
      },
    });
  }

  //All roles (both trainer and learners) need to list modules
  async findAll(organisationId: number) {
    return this.prisma.module.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  //Single module with included scenarios for frontend to render
  async findOne(id: number, organisationId: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { scenarios: true },
    });
    if (!module) {
      throw new NotFoundException(`Module ${id} not found`);
    }
    if (module.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You do not have permission to access this module',
      );
    }
    return module;
  }

  async update(
    id: number,
    updateTrainingModuleDto: UpdateTrainingModuleDto,
    organisationId: number,
  ) {
    await this.loadModuleForOrganisation(id, organisationId);

    return this.prisma.module.update({
      where: { id },
      data: updateTrainingModuleDto,
    });
  }

  async remove(id: number, organisationId: number) {
    await this.loadModuleForOrganisation(id, organisationId);

    return this.prisma.module.delete({
      where: { id },
    });
  }

  //clean 404 instead of Prisma's default error for not found
  private async ensureExists(id: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!module) {
      throw new NotFoundException(`Module ${id} not found`);
    }
  }

  //assignedUsers is a Json column, this always hands back a safe number[]
  private readAssignedUsers(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is number => typeof item === 'number');
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
