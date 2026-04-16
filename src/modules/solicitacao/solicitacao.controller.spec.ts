import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

describe('SolicitacaoController', () => {
  let controller: SolicitacaoController;

  const mockSolicitacaoService = {
    criarSolicitacao: jest.fn(),
    updateSolicitacaoStatusById: jest.fn(),
    listarSolicitacoes: jest.fn(),
    enviarDocumento: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitacaoController],
      providers: [
        {
          provide: SolicitacaoService,
          useValue: mockSolicitacaoService,
        },
      ],
    }).compile();

    controller = module.get<SolicitacaoController>(SolicitacaoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar solicitacao com sucesso', async () => {
    const solicitacaoDto = {
      usuario_id: 1,
      veiculo_id: 2,
      servico_id: 3,
      observacao_cliente: 'Primeira solicitacao',
    };

    const resposta = {
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo: {
        cliente: {
          nome: 'Amanda Vithoria Alves Freitas',
        },
        servico: {
          nome: 'Renovacao CNH',
          valor_base: 200,
        },
        solicitacao: {
          data_solicitacao: '2026-03-10',
          prazo_estimado: '2026-03-20',
        },
      },
    };

    mockSolicitacaoService.criarSolicitacao.mockResolvedValue(resposta);

    await expect(controller.criarSolicitacao(solicitacaoDto)).resolves.toEqual(
      resposta,
    );
    expect(mockSolicitacaoService.criarSolicitacao).toHaveBeenCalledWith(
      solicitacaoDto,
    );
  });

  it('deve atualizar status via PATCH com sucesso', async () => {
    const updateDto = {
      status: StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO,
      observacaoAdmin: 'Aguardando pagamento do cliente',
    };

    const resposta = {
      message: 'Status da solicitação atualizado com sucesso.',
    };

    mockSolicitacaoService.updateSolicitacaoStatusById.mockResolvedValue(
      resposta,
    );

    await expect(
      controller.updateSolicitacaoStatus(1, updateDto),
    ).resolves.toEqual(resposta);

    expect(
      mockSolicitacaoService.updateSolicitacaoStatusById,
    ).toHaveBeenCalledWith(1, updateDto);
  });
});
