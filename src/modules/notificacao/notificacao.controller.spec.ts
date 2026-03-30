// src/notificacao/notificacao.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';

describe('NotificacaoController', () => {
  let controller: NotificacaoController;

  const mockNotificacaoService = {
    buscarNotificacoesPorUsuario: jest.fn().mockResolvedValue([]),
    marcarComoLida: jest.fn().mockResolvedValue({ id: 1, lida: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        { provide: NotificacaoService, useValue: mockNotificacaoService },
      ],
    }).compile();

    controller = module.get<NotificacaoController>(NotificacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('buscarPorUsuario deve retornar lista de notificações', async () => {
    const result = await controller.buscarPorUsuario(1);
    expect(mockNotificacaoService.buscarNotificacoesPorUsuario).toHaveBeenCalledWith(1);
    expect(result).toEqual([]);
  });

  it('marcarComoLida deve retornar notificação atualizada', async () => {
    const result = await controller.marcarComoLida(1);
    expect(result.lida).toBe(true);
  });
});
