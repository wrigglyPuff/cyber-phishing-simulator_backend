import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma, CueTag } from '@prisma/client';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) { }

  async create(createScenarioDto: CreateScenarioDto) {
    const { correctAnswer, correctCues, ...scenarioData } = createScenarioDto;

    if (!correctAnswer && !correctCues?.length) {
      throw new BadRequestException(
        'A scenario must have at least one choice or at least one cue selected.',
      );
    }

    return this.prisma.scenario.create({
      data: {
        ...scenarioData,
        correctAnswer: correctAnswer ? (correctAnswer as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        correctCues: correctCues ? (correctCues as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  async findAll(moduleId?: number, requestingUserId?: number, requestingUserRole?: string,) {
    const isLearner = requestingUserRole === 'LEARNER';

    if (isLearner) {
      const assignedModuleIds = await this.getAssignedModuleIds(requestingUserId!);

      //learner asks for a module not assigned to them
      if (moduleId !== undefined && !assignedModuleIds.includes(moduleId)) {
        return [];
      }

      return this.prisma.scenario.findMany({
        where: {
          moduleId: moduleId !== undefined ? moduleId : { in: assignedModuleIds },
        },
      });
    }

    return this.prisma.scenario.findMany({
      where: moduleId !== undefined ? { moduleId } : undefined,
    });
  }

  private async getAssignedModuleIds(userId: number): Promise<number[]> {
    const modules = await this.prisma.module.findMany({
      select: { id: true, assignedUsers: true },
    });
    return modules
      .filter((m) => {
        const ids = (m.assignedUsers ?? []) as unknown as number[];
        return ids.includes(userId);
      })
      .map((m) => m.id);
  }

  async findOne(id: number, requestingUserRole?: string) {
    const scenario = await this.prisma.scenario.findUnique({ where: { id } });
    if (!scenario) return null;

    const isTrainerOrAdmin =
      requestingUserRole === 'TRAINER' || requestingUserRole === 'GLOBAL_ADMIN';

    if (isTrainerOrAdmin) {
      return scenario; //full record, including correctAnswer/correctCues
    }

    return {
      scenarioId: scenario.id,
      moduleId: scenario.moduleId,
      title: scenario.title,
      content: scenario.content,
      interactionType: scenario.interactionType,
    };
  }

  async update(id: number, updateScenarioDto: UpdateScenarioDto) {
    return this.prisma.scenario.update({
      where: { id },
      data: updateScenarioDto as Prisma.ScenarioUncheckedUpdateInput,
    });
  }

  async remove(id: number) {
    const attemptCount = await this.prisma.scenarioAttempt.count({
      where: { scenarioId: id },
    });

    if (attemptCount > 0) {
      throw new ConflictException(
        `Cannot delete scenario ${id}: ${attemptCount} learner attempt(s) exist for it. Deleting this would destroy training history`,
      );
    }

    return this.prisma.scenario.delete({
      where: { id },
    });
  }
}
