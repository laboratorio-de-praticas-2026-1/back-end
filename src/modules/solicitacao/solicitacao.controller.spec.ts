import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
import { AdminGuard } from '../usuario/guards/admin.guard';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

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
    })
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<SolicitacaoController>(SolicitacaoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar solicitacao com sucesso', async () => {
    const solicitacaoDto = {
      veiculo_id: 2,
      servico_id: 3,
      observacao_cliente: 'Primeira solicitacao',
    };
    const mockReq = { user: { id: 1 } };

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

    await expect(
      controller.criarSolicitacao(solicitacaoDto, mockReq),
    ).resolves.toEqual(resposta);
    expect(mockSolicitacaoService.criarSolicitacao).toHaveBeenCalledWith(
      solicitacaoDto,
      1,
    );
  });
});
