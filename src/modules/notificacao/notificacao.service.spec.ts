import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoService } from './notificacao.service';
import { Sequelize } from 'sequelize-typescript';
import { EmailService } from '../../infra/email/email.service';

describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let mockSequelize: { query: jest.Mock };
  let mockEmailService: { enviarEmail: jest.Mock };

  beforeEach(async () => {
    mockSequelize = { query: jest.fn() };
    mockEmailService = { enviarEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoService,
        { provide: Sequelize, useValue: mockSequelize },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NotificacaoService>(NotificacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});