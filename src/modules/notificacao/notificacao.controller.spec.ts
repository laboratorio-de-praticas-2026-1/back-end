import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { Sequelize } from 'sequelize-typescript';
import { EmailService } from '../../infra/email/email.service';

describe('NotificacaoController', () => {
  let controller: NotificacaoController;
  let mockNotificacaoService: {
    processarEnvioDeDebitos: jest.Mock;
    getUserNotifications: jest.Mock;
  };

  beforeEach(async () => {
    mockNotificacaoService = {
      processarEnvioDeDebitos: jest.fn().mockResolvedValue(undefined),
      getUserNotifications: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        { provide: NotificacaoService, useValue: mockNotificacaoService },
        { provide: Sequelize, useValue: { query: jest.fn() } },
        { provide: EmailService, useValue: { enviarEmail: jest.fn() } },
      ],
    }).compile();

    controller = module.get<NotificacaoController>(NotificacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});