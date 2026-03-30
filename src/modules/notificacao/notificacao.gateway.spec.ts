// src/notificacao/notificacao.gateway.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoGateway } from './notificacao.gateway';
import { NotificacaoService } from './notificacao.service';

describe('NotificacaoGateway', () => {
  let gateway: NotificacaoGateway;

  const mockNotificacaoService = {
    notificarVencimentoCNH: jest.fn(),
    notificarLicenciamentoProximo: jest.fn(),
    notificarNovoDebito: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoGateway,
        { provide: NotificacaoService, useValue: mockNotificacaoService },
      ],
    }).compile();

    gateway = module.get<NotificacaoGateway>(NotificacaoGateway);

    // Mock do server do socket.io
    (gateway as any).server = { emit: jest.fn(), to: jest.fn().mockReturnThis() };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('enviarNotificacao deve emitir o evento correto', () => {
    gateway.enviarNotificacao('alerta_cnh', { usuarioId: 1 });
    expect((gateway as any).server.emit).toHaveBeenCalledWith('alerta_cnh', { usuarioId: 1 });
  });
});
