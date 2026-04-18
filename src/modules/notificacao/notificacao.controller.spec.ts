import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { Sequelize } from 'sequelize-typescript';

const mockSequelize = {
  query: jest.fn(),
};

describe('NotificacaoController', () => {
  let controller: NotificacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        NotificacaoService,
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    controller = module.get<NotificacaoController>(NotificacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});