import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';
import { PrismaService } from '../prisma.service';

describe('ScenariosService', () => {
  let service: ScenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        {
          provide: PrismaService,
          useValue: {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
