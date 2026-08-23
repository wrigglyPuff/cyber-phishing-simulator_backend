import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, CueTag } from '@prisma/client';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  async create(createScenarioDto: CreateScenarioDto) {
    const { choices, ...scenarioData } = createScenarioDto;

    if (!choices?.length && !createScenarioDto.cues?.length) {
      throw new BadRequestException(
        'A scenario must have at least one choice or at least one cue.',
      );
    }

    return this.prisma.scenario.create({
      data: {
        ...scenarioData,
        choices: (choices ?? []) as unknown as Prisma.InputJsonValue,
        cues: (createScenarioDto.cues ?? []).map((cue) => ({
          ...cue,
          tag: cue.tag ?? CueTag.OTHER,
        })) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(moduleId?: number) {
    return this.prisma.scenario.findMany({
      where: moduleId !== undefined ? { moduleId } : undefined,
    });
  }

  async findOne(id: number) {
    return this.prisma.scenario.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateScenarioDto: UpdateScenarioDto) {
    const { choices, cues, ...scenarioData } = updateScenarioDto;
    return this.prisma.scenario.update({
      where: { id },
      data: scenarioData,
    });
  }

  async remove(id: number) {
    return this.prisma.scenario.delete({
      where: { id },
    });
  }
}
