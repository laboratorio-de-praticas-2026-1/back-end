// src/modules/header/header.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';
import { getModelToken } from '@nestjs/sequelize';
import { Banner } from '../../models/banner.model';

describe('HeaderController', () => {
  let controller: HeaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeaderController],
      providers: [
        HeaderService,
        {
          provide: getModelToken(Banner),
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<HeaderController>(HeaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
