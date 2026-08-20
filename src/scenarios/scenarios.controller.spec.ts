import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

describe('ScenariosController', () => {
  let controller: ScenariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenariosController],
      providers: [
        {
          provide: ScenariosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ScenariosController>(ScenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
