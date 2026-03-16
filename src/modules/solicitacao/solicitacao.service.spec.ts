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
    });
    mockSolicitacaoModel.create.mockResolvedValue({
      id: 10,
    });
    mockNotificacaoService.enviarConfirmacaoSolicitacao.mockResolvedValue(
      undefined,
    );

    await expect(service.criarSolicitacao(solicitacaoDto)).resolves.toEqual({
      message: 'Solicitação de serviço criada com sucesso',
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
      servicoNome: 'Transferencia',
    });
  });

  it('deve criar solicitacao sem veiculo quando nao informado', async () => {
    const solicitacaoDto = {
      usuario_id: 1,
      servico_id: 3,
      observacao_cliente: 'Observacao sem veiculo',
    };

    mockUsuarioModel.findByPk.mockResolvedValue({
      id: 1,
      nome: 'Amanda',
      email: 'amanda@email.com',
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
    });
    mockSolicitacaoModel.create.mockResolvedValue({
      id: 11,
    });
    mockNotificacaoService.enviarConfirmacaoSolicitacao.mockResolvedValue(
      undefined,
    );

    await expect(service.criarSolicitacao(solicitacaoDto)).resolves.toEqual({
      message: 'Solicitação de serviço criada com sucesso',
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

  it('deve falhar quando usuario nao for encontrado', async () => {
    mockUsuarioModel.findByPk.mockResolvedValue(null);
    mockVeiculoModel.findByPk.mockResolvedValue({
      id: 2,
      usuarioId: 1,
    });
    mockServicoModel.findByPk.mockResolvedValue({
      id: 3,
      nome: 'Transferencia',
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
