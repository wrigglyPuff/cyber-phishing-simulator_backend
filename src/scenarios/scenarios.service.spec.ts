import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';
import { PrismaService } from '../prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('ScenariosService', () => {
  let service: ScenariosService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        {
          provide: PrismaService,
          useValue: {
            module: {
              findMany: jest.fn(),
            },
            scenario: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should limit a trainer to their own organisation', async () => {
      prisma.scenario.findMany.mockResolvedValue([]);

      await service.findAll(4, 10, Role.TRAINER);

      expect(prisma.scenario.findMany).toHaveBeenCalledWith({
        where: { module: { organisationId: 4 } },
      });
    });

    it('should list every organisation for a global admin with no filter', async () => {
      prisma.scenario.findMany.mockResolvedValue([]);

      await service.findAll(null, 1, Role.GLOBAL_ADMIN);

      expect(prisma.scenario.findMany).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('findOne', () => {
    const scenario = { id: 9, moduleId: 3, module: { organisationId: 7 } };

    it('should forbid a trainer from another organisation', async () => {
      prisma.scenario.findUnique.mockResolvedValue(scenario);

      await expect(service.findOne(9, 4, 10, Role.TRAINER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should let a global admin read a scenario in any organisation', async () => {
      prisma.scenario.findUnique.mockResolvedValue(scenario);

      await expect(service.findOne(9, null, 1, Role.GLOBAL_ADMIN)).resolves.toEqual({
        id: 9,
        moduleId: 3,
      });
    });
  });

  describe('learner view', () => {
    const fullScenario = {
      id: 9,
      moduleId: 3,
      title: 'Reset your password',
      content: 'Click here',
      interactionType: 'EMAIL',
      difficulty: 'EASY',
      correctAnswer: 'Suspicious',
      correctCues: null,
      module: { organisationId: 4 },
    };

    beforeEach(() => {
      prisma.module.findMany.mockResolvedValue([{ id: 3, assignedUsers: [10] }]);
    });

    it('should never send a learner the answer when listing', async () => {
      prisma.scenario.findMany.mockResolvedValue([fullScenario]);

      const result = await service.findAll(4, 10, Role.LEARNER);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('correctAnswer');
      expect(result[0]).not.toHaveProperty('correctCues');
    });

    it('should never send a learner the answer when reading one', async () => {
      prisma.scenario.findUnique.mockResolvedValue(fullScenario);

      const result = await service.findOne(9, 4, 10, Role.LEARNER);

      expect(result).not.toHaveProperty('correctAnswer');
      expect(result).not.toHaveProperty('correctCues');
      expect(result).toEqual(expect.objectContaining({ scenarioId: 9, answerMode: 'simple' }));
    });

    it('should give a learner without an organisation nothing, not every scenario', async () => {
      const result = await service.findAll(null, 10, Role.LEARNER);

      expect(result).toEqual([]);
      expect(prisma.scenario.findMany).not.toHaveBeenCalled();
    });

    it("should refuse a scenario outside the learner's assigned modules", async () => {
      prisma.module.findMany.mockResolvedValue([{ id: 99, assignedUsers: [10] }]);
      prisma.scenario.findUnique.mockResolvedValue(fullScenario);

      await expect(service.findOne(9, 4, 10, Role.LEARNER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
