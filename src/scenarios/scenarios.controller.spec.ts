import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('ScenariosController', () => {
  let controller: ScenariosController;
  let service: { findAll: jest.Mock; findOne: jest.Mock };

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
    service = module.get(ScenariosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should scope a learner's list to their own organisation", () => {
    controller.findAll({ user: { role: Role.LEARNER, organisationId: 4, userId: 10 } });

    expect(service.findAll).toHaveBeenCalledWith(4, 10, Role.LEARNER, undefined);
  });

  it('should ignore an organisationId filter from anyone but a global admin', () => {
    controller.findAll({ user: { role: Role.TRAINER, organisationId: 4, userId: 2 } }, undefined, 7);

    expect(service.findAll).toHaveBeenCalledWith(4, 2, Role.TRAINER, undefined);
  });

  it('should refuse, not widen, access for a non-admin without an organisation', () => {
    const orphan = { user: { role: Role.LEARNER, organisationId: null, userId: 10 } };

    expect(() => controller.findAll(orphan)).toThrow(ForbiddenException);
    expect(() => controller.findOne(orphan, 9)).toThrow(ForbiddenException);
    expect(service.findAll).not.toHaveBeenCalled();
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('should let a global admin list every organisation or filter to one', () => {
    const admin = { user: { role: Role.GLOBAL_ADMIN, organisationId: 1, userId: 1 } };

    controller.findAll(admin);
    controller.findAll(admin, undefined, 7);

    expect(service.findAll).toHaveBeenCalledWith(null, 1, Role.GLOBAL_ADMIN, undefined);
    expect(service.findAll).toHaveBeenCalledWith(7, 1, Role.GLOBAL_ADMIN, undefined);
  });
});
