import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoService } from './notificacao.service';
import { Sequelize } from 'sequelize-typescript';


const mockSequelize = {
  query: jest.fn(),
};

describe('NotificacaoService', () => {
  let service: NotificacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoService,
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<NotificacaoService>(NotificacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});