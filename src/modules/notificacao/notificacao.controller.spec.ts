import { Test, TestingModule } from '@nestjs/testing';
import { NotificacaoController } from './notificacao.controller';
import { NotificacaoService } from './notificacao.service';
import { HttpStatus } from '@nestjs/common';

describe('NotificacaoController', () => {
  let controller: NotificacaoController;
  let service: NotificacaoService;

  const mockNotificacaoService = {
    buscarNotificacoesDoUsuario: jest.fn(),
    buscarConfiguracoes: jest.fn(),
    atualizarConfiguracoes: jest.fn(),
    atualizarDataVencimentoCNH: jest.fn(),
    atualizarDataLicenciamento: jest.fn(),
    atualizarDebito: jest.fn(),
    limparDebito: jest.fn(),
    enviarNotificacao: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacaoController],
      providers: [
        {
          provide: NotificacaoService,
          useValue: mockNotificacaoService,
        },
      ],
    }).compile();

    controller = module.get<NotificacaoController>(NotificacaoController);
    service = module.get<NotificacaoService>(NotificacaoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('buscarNotificacoes', () => {
    it('deve retornar lista de notificações do usuário', async () => {
      const mockNotificacoes = [
        { id: 1, titulo: 'CNH vencendo', lida: false },
        { id: 2, titulo: 'Licenciamento vencendo', lida: false },
      ];
      mockNotificacaoService.buscarNotificacoesDoUsuario.mockResolvedValue(mockNotificacoes);

      const result = await controller.buscarNotificacoes(1);

      expect(service.buscarNotificacoesDoUsuario).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNotificacoes);
    });

    it('deve retornar array vazio quando não há notificações', async () => {
      mockNotificacaoService.buscarNotificacoesDoUsuario.mockResolvedValue([]);

      const result = await controller.buscarNotificacoes(1);

      expect(result).toEqual([]);
    });
  });

  describe('buscarConfiguracoes', () => {
    it('deve retornar configurações de notificação do usuário', async () => {
      const mockConfiguracoes = {
        notificacoesAtivas: true,
        diasAvisoCnh: 30,
        diasAvisoLicenciamento: 30,
        notificarDebitos: true,
        enviarEmail: true,
      };
      mockNotificacaoService.buscarConfiguracoes.mockResolvedValue(mockConfiguracoes);

      const result = await controller.buscarConfiguracoes(1);

      expect(service.buscarConfiguracoes).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConfiguracoes);
    });
  });

  describe('atualizarConfiguracoes', () => {
    it('deve atualizar configurações de notificação', async () => {
      const configuracoes = {
        notificacoesAtivas: false,
        diasAvisoCnh: 20,
      };
      const mockResultado = { id: 1, ...configuracoes };
      mockNotificacaoService.atualizarConfiguracoes.mockResolvedValue(mockResultado);

      const result = await controller.atualizarConfiguracoes(1, configuracoes);

      expect(service.atualizarConfiguracoes).toHaveBeenCalledWith(1, configuracoes);
      expect(result).toEqual(mockResultado);
    });
  });

  describe('atualizarDataCNH', () => {
    it('deve atualizar data de vencimento da CNH', async () => {
      const dataVencimento = '2025-12-31';
      const mockResultado = {
        id: 1,
        dataVencimentoCnh: new Date(dataVencimento),
      };
      mockNotificacaoService.atualizarDataVencimentoCNH.mockResolvedValue(mockResultado);

      const result = await controller.atualizarDataCNH(1, { dataVencimento });

      expect(service.atualizarDataVencimentoCNH).toHaveBeenCalledWith(
        1,
        expect.any(Date),
      );
      expect(result).toEqual(mockResultado);
    });

    it('deve converter string de data para Date corretamente', async () => {
      const dataVencimento = '2025-12-31';
      await controller.atualizarDataCNH(1, { dataVencimento });

      expect(service.atualizarDataVencimentoCNH).toHaveBeenCalledWith(
        1,
        new Date(dataVencimento),
      );
    });
  });

  describe('atualizarLicenciamento', () => {
    it('deve atualizar data de licenciamento do veículo', async () => {
      const dataVencimento = '2025-12-31';
      const mockResultado = {
        id: 1,
        dataVencimentoLicenciamento: new Date(dataVencimento),
      };
      mockNotificacaoService.atualizarDataLicenciamento.mockResolvedValue(mockResultado);

      const result = await controller.atualizarLicenciamento(1, { dataVencimento });

      expect(service.atualizarDataLicenciamento).toHaveBeenCalledWith(
        1,
        expect.any(Date),
      );
      expect(result).toEqual(mockResultado);
    });
  });

  describe('atualizarDebito', () => {
    it('deve atualizar débito do veículo', async () => {
      const debitoData = {
        valor: 250.5,
        descricao: 'IPVA 2025',
      };
      const mockResultado = {
        id: 1,
        valorDebitoTotal: 250.5,
        possuiDebitos: true,
      };
      mockNotificacaoService.atualizarDebito.mockResolvedValue(mockResultado);

      const result = await controller.atualizarDebito(1, debitoData);

      expect(service.atualizarDebito).toHaveBeenCalledWith(1, 250.5, 'IPVA 2025');
      expect(result).toEqual(mockResultado);
    });

    it('deve atualizar débito sem descrição', async () => {
      const debitoData = { valor: 100 };
      await controller.atualizarDebito(1, debitoData);

      expect(service.atualizarDebito).toHaveBeenCalledWith(1, 100, undefined);
    });
  });

  describe('limparDebito', () => {
    it('deve limpar débito do veículo', async () => {
      const mockResultado = {
        id: 1,
        valorDebitoTotal: 0,
        possuiDebitos: false,
      };
      mockNotificacaoService.limparDebito.mockResolvedValue(mockResultado);

      const result = await controller.limparDebito(1);

      expect(service.limparDebito).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResultado);
    });
  });

  describe('enviarEmail', () => {
    it('deve enviar email de notificação com sucesso', async () => {
      const notificacao = {
        usuarioId: 1,
        tipo: 'ALERTA_CNH',
        titulo: 'CNH vencendo',
        mensagem: 'Sua CNH vence em 10 dias',
      };
      mockNotificacaoService.enviarNotificacao.mockResolvedValue(true);

      const result = await controller.enviarEmail(notificacao);

      expect(service.enviarNotificacao).toHaveBeenCalledWith(notificacao);
      expect(result).toEqual({
        enviado: true,
        mensagem: 'Email enviado com sucesso',
      });
    });

    it('deve retornar falha quando o email não for enviado', async () => {
      const notificacao = {
        usuarioId: 1,
        tipo: 'ALERTA_CNH',
        titulo: 'CNH vencendo',
        mensagem: 'Sua CNH vence em 10 dias',
      };
      mockNotificacaoService.enviarNotificacao.mockResolvedValue(false);

      const result = await controller.enviarEmail(notificacao);

      expect(result).toEqual({
        enviado: false,
        mensagem: 'Falha ao enviar email',
      });
    });
  });
});