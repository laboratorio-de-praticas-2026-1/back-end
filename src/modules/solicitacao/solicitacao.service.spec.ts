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
import { EmailService } from 'src/infra/email/email.service';
import { SolicitacaoService } from './solicitacao.service';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

interface MockModel {
  create: jest.Mock;
  findByPk: jest.Mock;
  findAll?: jest.Mock;
}

interface MockNotificacao {
  enviarConfirmacaoSolicitacao: jest.Mock;
}

interface MockEmailService {
  enviarEmail: jest.Mock;
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
  let mockEmailService: MockEmailService;

  beforeEach(async () => {
    mockSolicitacaoModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
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

    mockEmailService = {
      enviarEmail: jest.fn().mockResolvedValue(undefined),
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
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadDocument: jest.fn(),
            generateTemporaryUrl: jest.fn(
              (publicId) => `https://temp-url/${publicId}`,
            ),
          },
        },
        {
          provide: CryptoUtil,
          useValue: {
            encrypt: jest.fn(
              (input: string) =>
                `${Buffer.from(input).toString('hex')}:encrypteddata`,
            ),
            decrypt: jest.fn((encrypted: string) => {
              const [hex] = encrypted.split(':');
              return Buffer.from(hex, 'hex').toString();
            }),
          },
        },
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

  describe('updateSolicitacaoStatusById', () => {
    const mockSolicitacaoComRelacoes = (
      status: string = 'recebido',
      id: number = 1,
    ) => ({
      id,
      status,
      usuario: { id: 1, nome: 'Amanda', email: 'amanda@email.com' },
      servico: { id: 3, nome: 'Transferencia' },
      update: jest.fn().mockResolvedValue(undefined),
    });

    const flushPromises = async () => {
      await jest.advanceTimersByTimeAsync(0);
    };

    it('deve atualizar status com sucesso', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido');
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      const result = await service.updateSolicitacaoStatusById(1, {
        status: StatusSolicitacaoEnum.EM_ANDAMENTO,
      });

      expect(result).toEqual({
        message: 'Status da solicitação atualizado com sucesso.',
      });
      expect(solicitacao.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'em_andamento' }),
      );
    });

    it('deve lancar erro quando solicitacao nao encontrada', async () => {
      mockSolicitacaoModel.findByPk.mockResolvedValue(null);

      await expect(
        service.updateSolicitacaoStatusById(999, {
          status: StatusSolicitacaoEnum.EM_ANDAMENTO,
        }),
      ).rejects.toThrow('Solicitação com ID 999 não encontrada');
    });

    it('deve definir dataConclusao quando status for concluido', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('em_andamento');
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(1, {
        status: StatusSolicitacaoEnum.CONCLUIDO,
      });

      expect(solicitacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'concluido',
          dataConclusao: expect.any(Date) as Date,
        }),
      );
    });

    it('deve enviar email quando status mudar para aguardando_pagamento', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido');
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(1, {
        status: StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'amanda@email.com',
          template: 'status-aguardando-pagamento',
        }),
      );
    });

    it('deve enviar email quando status mudar para aguardando_documento', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido', 2);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(2, {
        status: StatusSolicitacaoEnum.AGUARDANDO_DOCUMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'amanda@email.com',
          template: 'status-aguardando-documento',
        }),
      );
    });

    it('deve enviar email quando status mudar para concluido', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('em_andamento', 3);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(3, {
        status: StatusSolicitacaoEnum.CONCLUIDO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'amanda@email.com',
          template: 'status-concluido',
        }),
      );
    });

    it('deve enviar email quando status mudar para cancelado', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('em_andamento', 4);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(4, {
        status: StatusSolicitacaoEnum.CANCELADO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'amanda@email.com',
          template: 'status-cancelado',
        }),
      );
    });

    it('deve enviar email de reabertura quando cancelado mudar para em_andamento', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('cancelado', 5);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(5, {
        status: StatusSolicitacaoEnum.EM_ANDAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'amanda@email.com',
          template: 'status-reaberto',
        }),
      );
    });

    it('nao deve enviar email se o status nao mudou', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('em_andamento', 6);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(6, {
        status: StatusSolicitacaoEnum.EM_ANDAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).not.toHaveBeenCalled();
    });

    it('nao deve enviar email para transicoes sem regra de disparo', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido', 7);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(7, {
        status: StatusSolicitacaoEnum.EM_ANDAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).not.toHaveBeenCalled();
    });

    it('deve respeitar debounce e nao enviar email duplicado no intervalo', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido', 8);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(8, {
        status: StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).toHaveBeenCalledTimes(1);

      mockEmailService.enviarEmail.mockClear();
      solicitacao.status = 'recebido';

      await service.updateSolicitacaoStatusById(8, {
        status: StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO,
      });

      await flushPromises();

      expect(mockEmailService.enviarEmail).not.toHaveBeenCalled();
    });

    it('deve incluir observacaoAdmin no update quando fornecida', async () => {
      const solicitacao = mockSolicitacaoComRelacoes('recebido', 9);
      mockSolicitacaoModel.findByPk.mockResolvedValue(solicitacao);

      await service.updateSolicitacaoStatusById(9, {
        status: StatusSolicitacaoEnum.EM_ANDAMENTO,
        observacaoAdmin: 'Verificado pelo admin',
      });

      expect(solicitacao.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'em_andamento',
          observacaoAdmin: 'Verificado pelo admin',
        }),
      );
    });
  });
});
