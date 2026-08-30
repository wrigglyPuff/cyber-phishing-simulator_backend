import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, Scenario } from '@prisma/client';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) { }

  //Checks modules belong to an Organisation
  private async ensureModuleInOrganisation(
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
        'You do not have permission to access this module',
      );
    }
    return module;
  }

  private toLearnerView(scenario: Scenario) {
    return {
      scenarioId: scenario.id,
      moduleId: scenario.moduleId,
      title: scenario.title,
      content: scenario.content,
      interactionType: scenario.interactionType,
    };
  }

  async create(createScenarioDto: CreateScenarioDto, organisationId: number) {
    const { correctAnswer, correctCues, ...scenarioData } = createScenarioDto;

    const hasAnswer = correctAnswer !== undefined && correctAnswer !== null;
    const hasCues = Array.isArray(correctCues) && correctCues.length > 0;

    //simple scenario = correctAnswer 
    //detailed scenario = correctCues
    if (hasAnswer === hasCues) {
      throw new BadRequestException(
        'Provide either correctAnswer (simple scenario) or correctCues (detailed scenario), but not both.',
      );
    }

    await this.ensureModuleInOrganisation(scenarioData.moduleId, organisationId);

    return this.prisma.scenario.create({
      data: {
        ...scenarioData,
        correctAnswer: hasAnswer
          ? (correctAnswer as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        correctCues: hasCues
          ? (correctCues as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }

  async findAll(
    organisationId: number,
    requestingUserId: number,
    requestingUserRole: string,
    moduleId?: number,
  ) {
    const isLearner = requestingUserRole === Role.LEARNER;

    if (isLearner) {
      const assignedModuleIds = await this.getAssignedModuleIds(
        requestingUserId,
        organisationId,
      );

      //Fetch scenarios based on user roles (Learner vs Trainer vs Admin)
      if (moduleId !== undefined && !assignedModuleIds.includes(moduleId)) {
        return [];
      }

      const scenarios = await this.prisma.scenario.findMany({
        where: {
          moduleId: moduleId !== undefined ? moduleId : { in: assignedModuleIds },
        },
      });

      return scenarios.map((scenario) => this.toLearnerView(scenario));
    }

    return this.prisma.scenario.findMany({
      where: {
        module: { organisationId },
        ...(moduleId !== undefined ? { moduleId } : {}),
      },
    });
  }

  private async getAssignedModuleIds(
    userId: number,
    organisationId: number,
  ): Promise<number[]> {
    const modules = await this.prisma.module.findMany({
      where: { organisationId },
      select: { id: true, assignedUsers: true },
    });
    return modules
      .filter((m) => {
        const ids = (m.assignedUsers ?? []) as unknown as number[];
        return Array.isArray(ids) && ids.includes(userId);
      })
      .map((m) => m.id);
  }

  async findOne(
    id: number,
    organisationId: number,
    requestingUserId: number,
    requestingUserRole: string,
  ) {
    const scenario = await this.prisma.scenario.findUnique({
      where: { id },
      include: { module: true },
    });

    if (!scenario) {
      throw new NotFoundException(`Scenario ${id} not found`);
    }

    if (scenario.module.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You do not have permission to access this scenario',
      );
    }

    const { module, ...scenarioFields } = scenario;

    const isTrainerOrAdmin =
      requestingUserRole === Role.TRAINER ||
      requestingUserRole === Role.GLOBAL_ADMIN;

    if (isTrainerOrAdmin) {
      return scenarioFields;
    }

    const assignedModuleIds = await this.getAssignedModuleIds(
      requestingUserId,
      organisationId,
    );
    if (!assignedModuleIds.includes(scenarioFields.moduleId)) {
      throw new ForbiddenException(
        'This scenario is not part of a module assigned to you',
      );
    }

    return this.toLearnerView(scenarioFields);
  }

  async update(
    id: number,
    updateScenarioDto: UpdateScenarioDto,
    organisationId: number,
  ) {
    const existing = await this.prisma.scenario.findUnique({
      where: { id },
      include: { module: true },
    });

    if (!existing) {
      throw new NotFoundException(`Scenario ${id} not found`);
    }
    if (existing.module.organisationId !== organisationId) {
      throw new ForbiddenException(
        'You do not have permission to update this scenario',
      );
    }

    const { correctAnswer, correctCues, ...scenarioData } = updateScenarioDto;

    const hasAnswer = correctAnswer !== undefined && correctAnswer !== null;
    const hasCues = Array.isArray(correctCues) && correctCues.length > 0;

    if (hasAnswer && hasCues) {
      throw new BadRequestException(
        'Please provide either a correctAnswer (for simple true/false) scenarios or correctCues (for multiple answer selected scenarios), can not aceept both styles',
      );
    }

    if (scenarioData.moduleId !== undefined) {
      await this.ensureModuleInOrganisation(
        scenarioData.moduleId,
        organisationId,
      );
    }

    const data: Prisma.ScenarioUncheckedUpdateInput = { ...scenarioData };

    if (hasAnswer) {
      data.correctAnswer = correctAnswer as Prisma.InputJsonValue;
      data.correctCues = Prisma.JsonNull;
    }
    if (hasCues) {
      data.correctCues = correctCues as Prisma.InputJsonValue;
      data.correctAnswer = Prisma.JsonNull;
    }

    return this.prisma.scenario.update({
      where: { id },
      data,
    });
  }
  async remove(id: number, organisationId: number) {
    const existing = await this.prisma.scenario.findUnique({
      where: { id },
      include: { module: true }
    });

    if (!existing) {
      throw new NotFoundException(`Scenario ${id} not found`);
    }

    if (existing.module.organisationId !== organisationId) {
      throw new ForbiddenException('You do not have permission to delete this scenario',
      );
    }

    const attemptCount = await this.prisma.scenarioAttempt.count({
      where: { scenarioId: id },
    });

    if (attemptCount > 0) {
      throw new ConflictException(
        `Cannot delete scenario ${id}: ${attemptCount} learner attempt(s) exist for this scenario. Deleting this would destroy training history`,
      );
    }

    await this.prisma.scenario.delete({
      where: { id },
    });

    return { message: 'Scenario deleted successfully' };
  }
}