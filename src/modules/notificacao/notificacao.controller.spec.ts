import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { getModelToken } from '@nestjs/sequelize';

const mockSequelize = {};
const mockDebitoModel = {};

describe('NotificacaoController', () => {
  let controller: NotificacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        NotificacaoService,
        { provide: 'SEQUELIZE', useValue: mockSequelize },
        { provide: getModelToken('Debito'), useValue: mockDebitoModel },
      ],
    }).compile();

    controller = module.get<NotificacaoController>(NotificacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});