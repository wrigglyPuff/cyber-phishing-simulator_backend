import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsService } from './attempts.service';
import { PrismaService } from '../prisma.service';

describe('AttemptsService', () => {
  let service: AttemptsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        {
          provide: PrismaService,
          useValue: {
            module: { findUnique: jest.fn() },
            attempt: { create: jest.fn(), findUnique: jest.fn() },
            scenarioChoice: { findUnique: jest.fn() },
            scenarioAttempt: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
