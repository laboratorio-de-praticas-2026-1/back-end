import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { SolicitacaoService } from './solicitacao.service';

interface MockModel {
  create: jest.Mock;
  findByPk: jest.Mock;
}

interface MockNotificacao {
  enviarConfirmacaoSolicitacao: jest.Mock;
}

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  let mockSolicitacaoModel: MockModel;
  let mockDocumentoModel: MockModel;
  let mockUsuarioModel: MockModel;
  let mockVeiculoModel: MockModel;
  let mockServicoModel: MockModel;
  let mockNotificacaoService: MockNotificacao;

  beforeEach(async () => {
    mockSolicitacaoModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    mockDocumentoModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    mockUsuarioModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    mockVeiculoModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    mockServicoModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
    };

    mockNotificacaoService = {
      enviarConfirmacaoSolicitacao: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitacaoService,
        {
          provide: getModelToken(Solicitacao),
          useValue: mockSolicitacaoModel,
        },
        {
          provide: getModelToken(DocumentoSolicitacao),
          useValue: mockDocumentoModel,
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
        {
          provide: CloudinaryService,
          useValue: {
            uploadDocument: jest.fn(),
            generateTemporaryUrl: jest.fn((publicId) => `https://temp-url/${publicId}`),
          },
        },
        {
          provide: CryptoUtil,
          useValue: {
            encrypt: jest.fn((input) => `${Buffer.from(input).toString('hex')}:encrypteddata`),
            decrypt: jest.fn((encrypted) => {
              const [hex] = encrypted.split(':');
              return Buffer.from(hex, 'hex').toString();
            }),
          },
        }
      ],
    }).compile();

    service = module.get<SolicitacaoService>(SolicitacaoService);
  });

  afterEach(() => {
    jest.resetAllMocks();
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
    ).rejects.toThrow('Usuário não encontrado');
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
    ).rejects.toThrow('O veículo informado não pertence ao usuário');
  });
});
