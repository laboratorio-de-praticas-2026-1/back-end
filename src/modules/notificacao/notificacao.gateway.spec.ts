import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoGateway } from './notificacao.gateway';
import { NotificacaoService } from './notificacao.service';

describe('NotificacaoGateway', () => {
  let gateway: NotificacaoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificacaoGateway, NotificacaoService],
    }).compile();

    gateway = module.get<NotificacaoGateway>(NotificacaoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
