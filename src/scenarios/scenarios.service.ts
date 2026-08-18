import { Injectable } from '@nestjs/common';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  async create(createScenarioDto: CreateScenarioDto) {
    const { choices, ...scenarioData } = createScenarioDto;
    return this.prisma.scenario.create({
      data: {
        ...scenarioData,
        choices: {
          create: choices,
        },
        cues: {
          create: createScenarioDto.cues,
        },
      },
      include: {
        choices: true,
        cues: true,
      },
    });
  }

  async findAll() {
    return this.prisma.scenario.findMany();
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
