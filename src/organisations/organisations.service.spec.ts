import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { OrganisationsService } from './organisations.service';
import { PrismaService } from '../prisma.service';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let prisma: {
    organisation: { findMany: jest.Mock };
    user: { groupBy: jest.Mock };
    module: { groupBy: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      organisation: { findMany: jest.fn() },
      user: { groupBy: jest.fn() },
      module: { groupBy: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
  });

  describe('findAll', () => {
    it('should list every organisation with its member and module counts', async () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      prisma.organisation.findMany.mockResolvedValue([
        { id: 1, name: 'Acme', createdAt, updatedAt: createdAt },
        { id: 2, name: 'Globex', createdAt, updatedAt: createdAt },
      ]);
      prisma.user.groupBy.mockResolvedValue([
        { organisationId: 1, role: Role.LEARNER, _count: { _all: 4 } },
        { organisationId: 1, role: Role.TRAINER, _count: { _all: 1 } },
      ]);
      prisma.module.groupBy.mockResolvedValue([
        { organisationId: 1, _count: { _all: 3 } },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Acme',
          learnerCount: 4,
          trainerCount: 1,
          moduleCount: 3,
          createdAt,
          updatedAt: createdAt,
        },
        {
          id: 2,
          name: 'Globex',
          learnerCount: 0,
          trainerCount: 0,
          moduleCount: 0,
          createdAt,
          updatedAt: createdAt,
        },
      ]);
    });
  });
});
