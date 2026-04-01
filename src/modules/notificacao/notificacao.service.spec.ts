import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { NotFoundException } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { EmailService } from './email.service';


describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let usuarioModel: typeof Usuario;
  let veiculoModel: typeof Veiculo;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacaoService,
        {
          provide: getModelToken(Usuario),
          useValue: {
            findByPk: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: getModelToken(Veiculo),
          useValue: {
            findByPk: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            enviarNotificacao: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<NotificacaoService>(NotificacaoService);
    usuarioModel = module.get<typeof Usuario>(getModelToken(Usuario));
    veiculoModel = module.get<typeof Veiculo>(getModelToken(Veiculo));
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verificarVencimentoCNH', () => {
    it('deve retornar notificação quando CNH está vencendo', async () => {
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 10);

      const mockUsuario = {
        id: 1,
        dataVencimentoCnh: dataVencimento,
        diasAvisoCnh: 30,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const resultado = await service.verificarVencimentoCNH(1);

      expect(resultado).toBeDefined();
      expect(resultado.tipo).toBe('ALERTA_CNH');
      expect(resultado.diasRestantes).toBe(10);
    });

    it('deve lançar NotFoundException se usuário não existir', async () => {
      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(null);

      await expect(service.verificarVencimentoCNH(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve retornar null se CNH não está próxima de vencer', async () => {
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 100); // 100 dias

      const mockUsuario = {
        id: 1,
        dataVencimentoCnh: dataVencimento,
        diasAvisoCnh: 30,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const resultado = await service.verificarVencimentoCNH(1);

      expect(resultado).toBeNull();
    });

    it('deve retornar null se data_vencimento_cnh é nula', async () => {
      const mockUsuario = {
        id: 1,
        dataVencimentoCnh: null,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const resultado = await service.verificarVencimentoCNH(1);

      expect(resultado).toBeNull();
    });
  });

  describe('atualizarDataVencimentoCNH', () => {
    it('deve atualizar a data de vencimento de CNH', async () => {
      const novaData = new Date('2025-04-15');
      const mockUsuario = {
        id: 1,
        dataVencimentoCnh: null,
        update: jest.fn().mockResolvedValue({ dataVencimentoCnh: novaData }),
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const resultado = await service.atualizarDataVencimentoCNH(1, novaData);

      expect(mockUsuario.update).toHaveBeenCalledWith({
        dataVencimentoCnh: novaData,
      });
    });
  });

  describe('atualizarDebito', () => {
    it('deve registrar novo débito no veículo', async () => {
      const mockVeiculo = {
        id: 1,
        valorDebitoTotal: 0,
        possuiDebitos: false,
        update: jest.fn().mockResolvedValue({
          valorDebitoTotal: 250.5,
          possuiDebitos: true,
        }),
      };

      jest.spyOn(veiculoModel, 'findByPk').mockResolvedValue(mockVeiculo as any);

      const resultado = await service.atualizarDebito(1, 250.5);

      expect(mockVeiculo.update).toHaveBeenCalledWith({
        possuiDebitos: true,
        valorDebitoTotal: 250.5,
        dataUltimoDebito: expect.any(Date),
      });
    });

    it('deve lançar erro se veículo não existe', async () => {
      jest.spyOn(veiculoModel, 'findByPk').mockResolvedValue(null);

      await expect(service.atualizarDebito(99, 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('limparDebito', () => {
    it('deve limpar débito do veículo', async () => {
      const mockVeiculo = {
        id: 1,
        valorDebitoTotal: 250.5,
        possuiDebitos: true,
        update: jest.fn().mockResolvedValue({
          valorDebitoTotal: 0,
          possuiDebitos: false,
          dataUltimoDebito: null,
        }),
      };

      jest.spyOn(veiculoModel, 'findByPk').mockResolvedValue(mockVeiculo as any);

      await service.limparDebito(1);

      expect(mockVeiculo.update).toHaveBeenCalledWith({
        possuiDebitos: false,
        valorDebitoTotal: 0,
        dataUltimoDebito: null,
      });
    });
  });

  describe('enviarNotificacao', () => {
    it('deve enviar email de notificação', async () => {
      const mockUsuario = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        enviarEmail: true,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const notificacao = {
        usuarioId: 1,
        tipo: 'ALERTA_CNH' as const,
        titulo: 'CNH vencendo',
        mensagem: 'Sua CNH vence em 10 dias',
        diasRestantes: 10,
        dataVencimento: new Date('2025-04-15'),
      };

      const resultado = await service.enviarNotificacao(notificacao);

      expect(emailService.enviarNotificacao).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });

    it('não deve enviar email se enviarEmail é false', async () => {
      const mockUsuario = {
        id: 1,
        enviarEmail: false,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const notificacao = {
        usuarioId: 1,
        tipo: 'ALERTA_CNH' as const,
        titulo: 'CNH vencendo',
        mensagem: 'Sua CNH vence em 10 dias',
      };

      const resultado = await service.enviarNotificacao(notificacao);

      expect(resultado).toBe(false);
      expect(emailService.enviarNotificacao).not.toHaveBeenCalled();
    });
  });

  describe('buscarConfiguracoes', () => {
    it('deve retornar configurações de notificação do usuário', async () => {
      const mockUsuario = {
        id: 1,
        notificacoesAtivas: true,
        diasAvisoCnh: 30,
        diasAvisoLicenciamento: 30,
        notificarDebitos: true,
        enviarEmail: true,
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const resultado = await service.buscarConfiguracoes(1);

      expect(resultado).toEqual({
        notificacoesAtivas: true,
        diasAvisoCnh: 30,
        diasAvisoLicenciamento: 30,
        notificarDebitos: true,
        enviarEmail: true,
      });
    });
  });

  describe('atualizarConfiguracoes', () => {
    it('deve atualizar configurações de notificação', async () => {
      const mockUsuario = {
        id: 1,
        notificacoesAtivas: true,
        diasAvisoCnh: 30,
        update: jest.fn().mockResolvedValue({
          notificacoesAtivas: false,
          diasAvisoCnh: 20,
        }),
      };

      jest.spyOn(usuarioModel, 'findByPk').mockResolvedValue(mockUsuario as any);

      const configuracoes = {
        notificacoesAtivas: false,
        diasAvisoCnh: 20,
      };

      await service.atualizarConfiguracoes(1, configuracoes);

      expect(mockUsuario.update).toHaveBeenCalledWith(
        expect.objectContaining(configuracoes),
      );
    });
  });
});
