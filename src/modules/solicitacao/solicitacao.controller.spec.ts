import { Test, TestingModule } from '@nestjs/testing';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';
import { ListSolicitacoesQueryDto } from './dto/list-solicitacoes-query.dto';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
describe('SolicitacaoController', () => {
  let controller: SolicitacaoController;
  const mockSolicitacaoService = {
    criarSolicitacao: jest.fn(),
    updateSolicitacaoStatusById: jest.fn(),
    cancelarSolicitacao: jest.fn(),
    reabrirSolicitacao: jest.fn(),
    listarSolicitacoes: jest.fn(),
    enviarDocumento: jest.fn(),
    substituirDocumento: jest.fn(),
  };
  const mockGuard = {
    canActivate: jest.fn().mockReturnValue(true),
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
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
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
  it('deve listar solicitacoes com filtros', async () => {
    const filtros = {
      status: StatusSolicitacaoEnum.EM_ANDAMENTO,
      concluida: false,
      nome: 'Amanda',
    };
    const resposta = {
      total: 0,
      solicitacoes: [],
    };
    mockSolicitacaoService.listarSolicitacoes.mockResolvedValue(resposta);
    await expect(controller.listarSolicitacoes(filtros)).resolves.toEqual(
      resposta,
    );
    expect(mockSolicitacaoService.listarSolicitacoes).toHaveBeenCalledWith(
      filtros,
    );
  });
  it('deve cancelar solicitacao com sucesso', async () => {
    const resposta = { id: 123, status: 'cancelado' };
    mockSolicitacaoService.cancelarSolicitacao.mockResolvedValue(resposta);
    await expect(controller.cancelarSolicitacao(123)).resolves.toEqual(
      resposta,
    );
    expect(mockSolicitacaoService.cancelarSolicitacao).toHaveBeenCalledWith(
      123,
    );
  });
  it('deve reabrir solicitacao com sucesso', async () => {
    const resposta = { id: 123, status: 'em_andamento' };
    mockSolicitacaoService.reabrirSolicitacao.mockResolvedValue(resposta);
    await expect(controller.reabrirSolicitacao(123)).resolves.toEqual(resposta);
    expect(mockSolicitacaoService.reabrirSolicitacao).toHaveBeenCalledWith(123);
  });
  it('deve listar solicitacoes com parametros de paginacao e ordenacao', async () => {
    const query: ListSolicitacoesQueryDto = {
      page: 2,
      limit: 5,
      orderBy: 'status',
      order: 'asc',
    };
    const resposta = {
      total: 0,
      page: 2,
      limit: 5,
      solicitacoes: [],
    };
    mockSolicitacaoService.listarSolicitacoes.mockResolvedValue(resposta);
    await expect(controller.listarSolicitacoes(query)).resolves.toEqual(
      resposta,
    );
    expect(mockSolicitacaoService.listarSolicitacoes).toHaveBeenCalledWith(
      query,
    );
  });
  it('deve substituir documento via PATCH com sucesso', async () => {
    const mockArquivo = {
      originalname: 'documento.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('fake-content'),
      size: 1024,
    } as Express.Multer.File;
    const resposta = {
      id: 10,
      mensagem: 'Documento substituído com sucesso',
    };
    mockSolicitacaoService.substituirDocumento.mockResolvedValue(resposta);
    await expect(
      controller.substituirDocumento(1, 10, mockArquivo),
    ).resolves.toEqual(resposta);
    expect(mockSolicitacaoService.substituirDocumento).toHaveBeenCalledWith(
      1,
      10,
      mockArquivo,
    );
  });
});
