import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';

describe('SolicitacaoController', () => {
  let controller: SolicitacaoController;

  const mockSolicitacaoService = {
    criarSolicitacao: jest.fn(),
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
      message: 'Solicitação de serviço criada com sucesso',
    };

    mockSolicitacaoService.criarSolicitacao.mockResolvedValue(resposta);

    await expect(controller.criarSolicitacao(solicitacaoDto)).resolves.toEqual(
      resposta,
    );
    expect(mockSolicitacaoService.criarSolicitacao).toHaveBeenCalledWith(
      solicitacaoDto,
    );
  });
});
