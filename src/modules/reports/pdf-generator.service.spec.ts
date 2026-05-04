import { Test, TestingModule } from '@nestjs/testing';
import { PdfGeneratorService } from './pdf-generator.service';
import { ReportQueries } from './queries/reports.queries';
import { RelatorioCategoria } from 'src/models/relatorio.model';
import { CreateReportDto } from './dto/create-report.dto';
import { Formatters } from 'src/commons/utils/formatters';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      emulateMediaType: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-fake')),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      copyPages: jest.fn().mockResolvedValue([{}]),
      addPage: jest.fn(),
      getPageIndices: jest.fn().mockReturnValue([0]),
      save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }),
    load: jest.fn().mockResolvedValue({
      copyPages: jest.fn().mockResolvedValue([{}]),
      getPageIndices: jest.fn().mockReturnValue([0]),
    }),
  },
}));

jest.mock('./utils/chart-renderer', () => ({
  renderLineChart: jest.fn().mockReturnValue('data:image/svg+xml;base64,fake'),
  renderPieChart: jest.fn().mockReturnValue('data:image/svg+xml;base64,fake'),
  renderBarChart: jest.fn().mockReturnValue('data:image/svg+xml;base64,fake'),
}));

const makeMockQueries = (): jest.Mocked<ReportQueries> =>
  ({
    getFinancialSummary: jest.fn().mockResolvedValue({ totalArrecadado: 0, totalTaxas: 0, totalPendente: 0 }),
    getFaturamentoDiluido: jest.fn().mockResolvedValue([]),
    getTodosDebitos: jest.fn().mockResolvedValue([]),
    getMetodosPagamento: jest.fn().mockResolvedValue({ pix: 2, boleto: 1 }),
    getParcelasVencer30Dias: jest.fn().mockResolvedValue([]),
    getFluxoRecebimento: jest.fn().mockResolvedValue([]),
    getDetalhesParcelas: jest.fn().mockResolvedValue({ parcelas: [], vencidas: [] }),
    getArrecadacaoPorServico: jest.fn().mockResolvedValue([]),
    getFaturamentoComTaxa: jest.fn().mockResolvedValue(0),
    getServicosPrestados: jest.fn().mockResolvedValue([]),
    getSolicitacoesPorServico: jest.fn().mockResolvedValue([]),
    getSolicitacoesPorStatus: jest.fn().mockResolvedValue({ total: 0, porStatus: {} }),
    getTodasSolicitacoes: jest.fn().mockResolvedValue([]),
    getDocumentosPorStatus: jest.fn().mockResolvedValue({ total: 0, porStatus: {} }),
    getDocumentosByStatus: jest.fn().mockResolvedValue([]),
    getVeiculosComDebitosPendentes: jest.fn().mockResolvedValue([]),
    getTotalVeiculos: jest.fn().mockResolvedValue(0),
    getClientesNoperiodo: jest.fn().mockResolvedValue({ clientes: [], total: 0, taxaConversao: 0 }),
    getClientesComParcelasAtrasadas: jest.fn().mockResolvedValue([]),
    getTempoMedioConclusao: jest.fn().mockResolvedValue({ tempoMedio: 0, comparativo: [] }),
    getCasosEmVencimento: jest.fn().mockResolvedValue([]),
    getFunilConversao: jest.fn().mockResolvedValue({ totalConcluidas: 0, porServico: [], naoConvertidas: [] }),
    getGargalos: jest.fn().mockResolvedValue({
      paradasComTempo: [],
      tempoAcima: [],
      acumuloStatus: {},
      docsPendentes: [],
      clientesTravando: [],
    }),
  }) as any;

const makeMockFormatters = (): jest.Mocked<Formatters> =>
  ({
    fmtBRL: jest.fn().mockImplementation((value: number) => `R$ ${value.toFixed(2)}`),
    fmtDate: jest.fn().mockImplementation((date: Date | string | null | undefined) =>
      date ? new Date(date).toISOString().slice(0, 10) : '—',
    ),
  }) as any;

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;
  let mockQueries: jest.Mocked<ReportQueries>;
  let mockFormatters: jest.Mocked<Formatters>;
  let renderHtmlsToPdfSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockQueries = makeMockQueries();
    mockFormatters = makeMockFormatters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfGeneratorService,
        { provide: ReportQueries, useValue: mockQueries },
        { provide: Formatters, useValue: mockFormatters },
      ],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
    renderHtmlsToPdfSpy = jest
      .spyOn(service as any, 'renderHtmlsToPdf')
      .mockResolvedValue(Buffer.from('fake-pdf'));
  });

  afterEach(() => {
    renderHtmlsToPdfSpy?.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('deve retornar um Buffer para categoria performance_financeira', async () => {
      const dto: CreateReportDto = {
        nome: 'Financeiro Test',
        categoria: RelatorioCategoria.PERFORMANCE_FINANCEIRA,
      };

      const result = await service.generate(dto);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockQueries.getFinancialSummary).toHaveBeenCalled();
      expect(mockQueries.getFaturamentoDiluido).toHaveBeenCalled();
    });

    it('deve chamar todas as queries para relatorio_completo', async () => {
      const dto: CreateReportDto = {
        nome: 'Completo Test',
        categoria: RelatorioCategoria.RELATORIO_COMPLETO,
      };

      await service.generate(dto);

      expect(mockQueries.getFinancialSummary).toHaveBeenCalled();
      expect(mockQueries.getServicosPrestados).toHaveBeenCalled();
      expect(mockQueries.getSolicitacoesPorStatus).toHaveBeenCalled();
      expect(mockQueries.getDocumentosPorStatus).toHaveBeenCalled();
      expect(mockQueries.getTotalVeiculos).toHaveBeenCalled();
      expect(mockQueries.getClientesNoperiodo).toHaveBeenCalled();
      expect(mockQueries.getTempoMedioConclusao).toHaveBeenCalled();
      expect(mockQueries.getFunilConversao).toHaveBeenCalled();
      expect(mockQueries.getGargalos).toHaveBeenCalled();
    });

    it('deve chamar apenas as queries de solicitações para gestao_solicitacoes', async () => {
      const dto: CreateReportDto = {
        nome: 'Solicitações Test',
        categoria: RelatorioCategoria.GESTAO_SOLICITACOES,
      };

      await service.generate(dto);

      expect(mockQueries.getSolicitacoesPorStatus).toHaveBeenCalled();
      expect(mockQueries.getTodasSolicitacoes).toHaveBeenCalled();

      expect(mockQueries.getFinancialSummary).not.toHaveBeenCalled();
      expect(mockQueries.getTotalVeiculos).not.toHaveBeenCalled();
    });

    it('deve aceitar período indefinido no DTO', async () => {
      const dto: CreateReportDto = {
        nome: 'Test',
        categoria: RelatorioCategoria.GESTAO_SOLICITACOES,
      };

      await service.generate(dto);

      expect(mockQueries.getSolicitacoesPorStatus).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(mockFormatters.fmtDate).toHaveBeenCalledWith(undefined);
    });

    it('deve respeitar dataPeriodoInicio e dataPeriodoFim quando fornecidas', async () => {
      const inicio = new Date('2025-01-01');
      const fim = new Date('2025-03-31');

      const dto: CreateReportDto = {
        nome: 'Test',
        categoria: RelatorioCategoria.GESTAO_SOLICITACOES,
        dataPeriodoInicio: inicio,
        dataPeriodoFim: fim,
      };

      await service.generate(dto);

      const [chamadaInicio, chamadaFim] =
        mockQueries.getSolicitacoesPorStatus.mock.calls[0] as [Date, Date];

      expect(chamadaInicio.toDateString()).toBe(inicio.toDateString());
      expect(chamadaFim.toDateString()).toBe(fim.toDateString());
    });
  });
});
