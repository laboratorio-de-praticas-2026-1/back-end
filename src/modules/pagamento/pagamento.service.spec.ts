import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoService } from './pagamento.service';
import { DebitoService } from '../debito/debito.service';
import { TipoPagamento } from 'src/models/pagamento.model';
import { SimulacaoPagamentoRequestDto } from './dto/simulacao-pagamento-request-require.dto';

describe('PagamentoService', () => {
  let service: PagamentoService;
  let debitoService: Partial<DebitoService>;

  beforeEach(async () => {
    debitoService = {
      buscarDebitosPorPlaca: jest.fn().mockResolvedValue({
        placa: 'ABC1234',
        debitos: [
          { id: 1, descricao: 'IPVA', valor: 1000, status: 'ABERTO' },
          { id: 2, descricao: 'Multa', valor: 500, status: 'ABERTO' },
        ],
        total: 1500,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagamentoService,
        { provide: DebitoService, useValue: debitoService },
      ],
    }).compile();

    service = module.get<PagamentoService>(PagamentoService);
  });

  it('deve calcular simulação parcelada corretamente', async () => {
    const request: SimulacaoPagamentoRequestDto = {
      placa: 'ABC1234',
      qtdParcelas: 6,
      taxa: 0.05,
      tipoPagamento: TipoPagamento.PARCELADO,
    };

    const result = await service.simularPagamento(request);

    expect(result.valor_total).toBe(1500);
    expect(result.valor_com_juros).toBe(1575);
    expect(result.qtdParcelas).toBe(6);
    expect(result.valor_parcela).toBe(262.5);
    expect(result.saldo_restante).toBe(1575);
  });

  it('deve calcular simulação à vista corretamente', async () => {
    const request: SimulacaoPagamentoRequestDto = {
      placa: 'ABC1234',
      tipoPagamento: TipoPagamento.AVISTA,
    };

    const result = await service.simularPagamento(request);

    expect(result.qtdParcelas).toBe(1);
    expect(result.valor_parcela).toBe(result.valor_com_juros);
  });

  it('deve retornar valores zerados se não houver débitos', async () => {
    (debitoService.buscarDebitosPorPlaca as jest.Mock).mockResolvedValueOnce({
      placa: 'XYZ9876',
      debitos: [],
      total: 0,
    });

    const request: SimulacaoPagamentoRequestDto = {
      placa: 'XYZ9876',
      tipoPagamento: TipoPagamento.AVISTA,
    };

    const result = await service.simularPagamento(request);

    expect(result.valor_total).toBe(0);
    expect(result.valor_com_juros).toBe(0);
    expect(result.valor_parcela).toBe(0);
    expect(result.saldo_restante).toBe(0);
  });
});
