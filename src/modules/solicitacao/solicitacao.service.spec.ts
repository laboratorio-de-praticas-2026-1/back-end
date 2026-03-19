import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;

  const mockSolicitacaoModel = {
    create: jest.fn(),
  };

  const mockUsuarioModel = {
    findByPk: jest.fn(),
  };

  const mockVeiculoModel = {
    findByPk: jest.fn(),
  };

  const mockServicoModel = {
    findByPk: jest.fn(),
  };

  const mockNotificacaoService = {
    enviarConfirmacaoSolicitacao: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitacaoService,
        {
          provide: getModelToken(Solicitacao),
          useValue: mockSolicitacaoModel,
        },
        {
          provide: getModelToken(Usuario),
          useValue: mockUsuarioModel,
        },
        {
          provide: getModelToken(Veiculo),
          useValue: mockVeiculoModel,
        },
        {
          provide: getModelToken(Servico),
          useValue: mockServicoModel,
        },
        {
          provide: NotificacaoService,
          useValue: mockNotificacaoService,
        },
      ],
    }).compile();

    service = module.get<SolicitacaoService>(SolicitacaoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar solicitacao com sucesso', async () => {
    const solicitacaoDto = {
      usuario_id: 1,
      veiculo_id: 2,
      servico_id: 3,
      observacao_cliente: 'Observacao do cliente',
    };

    const dataSolicitacao = new Date('2026-03-10T12:00:00.000Z');

    mockUsuarioModel.findByPk.mockResolvedValue({
      id: 1,
      nome: 'Amanda',
      email: 'amanda@email.com',
    });
    mockVeiculoModel.findByPk.mockResolvedValue({
      id: 2,
      usuarioId: 1,
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
      valorBase: 200,
      prazoEstimadoDias: 10,
    });
    mockSolicitacaoModel.create.mockResolvedValue({
      id: 10,
      dataSolicitacao,
    });
    mockNotificacaoService.enviarConfirmacaoSolicitacao.mockResolvedValue(
      undefined,
    );

    await expect(service.criarSolicitacao(solicitacaoDto)).resolves.toEqual({
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo: {
        cliente: {
          nome: 'Amanda',
        },
        servico: {
          nome: 'Transferencia',
          valor_base: 200,
        },
        solicitacao: {
          data_solicitacao: '2026-03-10',
          prazo_estimado: '2026-03-20',
        },
      },
    });
    expect(mockSolicitacaoModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 1,
        veiculoId: 2,
        servicoId: 3,
        observacaoCliente: 'Observacao do cliente',
        status: 'recebido',
      }),
    );
    expect(
      mockNotificacaoService.enviarConfirmacaoSolicitacao,
    ).toHaveBeenCalledWith({
      email: 'amanda@email.com',
      nomeUsuario: 'Amanda',
      solicitacaoId: 10,
      protocolo: {
        cliente: {
          nome: 'Amanda',
        },
        servico: {
          nome: 'Transferencia',
          valor_base: 200,
        },
        solicitacao: {
          data_solicitacao: '2026-03-10',
          prazo_estimado: '2026-03-20',
        },
      },
    });
  });

  it('deve criar solicitacao sem veiculo quando nao informado', async () => {
    const solicitacaoDto = {
      usuario_id: 1,
      servico_id: 3,
      observacao_cliente: 'Observacao sem veiculo',
    };

    const dataSolicitacao = new Date('2026-03-10T12:00:00.000Z');

    mockUsuarioModel.findByPk.mockResolvedValue({
      id: 1,
      nome: 'Amanda',
      email: 'amanda@email.com',
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
      valorBase: 150,
      prazoEstimadoDias: 5,
    });
    mockSolicitacaoModel.create.mockResolvedValue({
      id: 11,
      dataSolicitacao,
    });
    mockNotificacaoService.enviarConfirmacaoSolicitacao.mockResolvedValue(
      undefined,
    );

    await expect(service.criarSolicitacao(solicitacaoDto)).resolves.toEqual({
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo: {
        cliente: {
          nome: 'Amanda',
        },
        servico: {
          nome: 'Transferencia',
          valor_base: 150,
        },
        solicitacao: {
          data_solicitacao: '2026-03-10',
          prazo_estimado: '2026-03-15',
        },
      },
    });
    expect(mockVeiculoModel.findByPk).not.toHaveBeenCalled();
    expect(mockSolicitacaoModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 1,
        veiculoId: null,
        servicoId: 3,
        observacaoCliente: 'Observacao sem veiculo',
        status: 'recebido',
      }),
    );
  });

  it('deve criar solicitacao mesmo se o envio do email falhar', async () => {
    const solicitacaoDto = {
      usuario_id: 1,
      veiculo_id: 2,
      servico_id: 3,
      observacao_cliente: 'Observacao com falha de email',
    };

    const dataSolicitacao = new Date('2026-03-10T12:00:00.000Z');

    mockUsuarioModel.findByPk.mockResolvedValue({
      id: 1,
      nome: 'Amanda',
      email: 'amanda@email.com',
    });
    mockVeiculoModel.findByPk.mockResolvedValue({
      id: 2,
      usuarioId: 1,
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
      valorBase: 200,
      prazoEstimadoDias: 10,
    });
    mockSolicitacaoModel.create.mockResolvedValue({
      id: 12,
      dataSolicitacao,
    });
    mockNotificacaoService.enviarConfirmacaoSolicitacao.mockRejectedValue(
      new Error('Falha no envio'),
    );

    await expect(service.criarSolicitacao(solicitacaoDto)).resolves.toEqual({
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo: {
        cliente: {
          nome: 'Amanda',
        },
        servico: {
          nome: 'Transferencia',
          valor_base: 200,
        },
        solicitacao: {
          data_solicitacao: '2026-03-10',
          prazo_estimado: '2026-03-20',
        },
      },
    });
  });

  it('deve falhar quando usuario nao for encontrado', async () => {
    mockUsuarioModel.findByPk.mockResolvedValue(null);
    mockVeiculoModel.findByPk.mockResolvedValue({
      id: 2,
      usuarioId: 1,
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
      valorBase: 200,
      prazoEstimadoDias: 10,
    });

    await expect(
      service.criarSolicitacao({
        usuario_id: 1,
        veiculo_id: 2,
        servico_id: 3,
      }),
    ).rejects.toThrow('Usuario nao encontrado');
  });

  it('deve falhar quando veiculo nao pertencer ao usuario', async () => {
    mockUsuarioModel.findByPk.mockResolvedValue({
      id: 1,
      nome: 'Amanda',
      email: 'amanda@email.com',
    });
    mockVeiculoModel.findByPk.mockResolvedValue({
      id: 2,
      usuarioId: 99,
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
      valorBase: 200,
      prazoEstimadoDias: 10,
    });

    await expect(
      service.criarSolicitacao({
        usuario_id: 1,
        veiculo_id: 2,
        servico_id: 3,
      }),
    ).rejects.toThrow('O veiculo informado nao pertence ao usuario');
  });
});
