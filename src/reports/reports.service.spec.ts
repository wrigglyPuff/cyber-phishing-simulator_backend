import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            module: { findMany: jest.fn(), findUnique: jest.fn() },
            moduleResults: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});