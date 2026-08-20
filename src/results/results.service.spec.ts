import { Test, TestingModule } from '@nestjs/testing';
import { ResultsService } from './results.service';
import { PrismaService } from '../prisma.service';

describe('ResultsService', () => {
  let service: ResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultsService,
        {
          provide: PrismaService,
          useValue: {
            attempt: { findUnique: jest.fn() },
            results: { create: jest.fn(), findMany: jest.fn() },
            scenarioAttempt: { findMany: jest.fn() },
            user: { findunique: jest.fn() },
            module: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ResultsService>(ResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
