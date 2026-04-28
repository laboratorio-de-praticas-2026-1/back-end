import { Injectable, BadRequestException } from '@nestjs/common';
import {
  SimulacaoPagamentoRequestDto,
  SimulacaoPagamentoResponseDto,
} from './dto/simulacao-pagamento-request-require.dto';
import { TipoPagamento } from 'src/models/pagamento.model';
import { DebitoService } from '../debito/debito.service';

@Injectable()
export class PagamentoService {
  constructor(private readonly debitoService: DebitoService) {}

  async simularPagamento(
    request: SimulacaoPagamentoRequestDto,
  ): Promise<SimulacaoPagamentoResponseDto> {
    // validações
    if (!request.placa) {
      throw new BadRequestException('Placa é obrigatória');
    }

    if (
      request.tipoPagamento === TipoPagamento.PARCELADO &&
      (!request.qtdParcelas || request.qtdParcelas <= 0)
    ) {
      throw new BadRequestException(
        'A Quantidade de parcelas deverá ser maior que 0',
      );
    }

    // Está buscando os débitos do veículo
    const debitoResponse = await this.debitoService.buscarDebitosPorPlaca(
      request.placa,
    );

    if (!debitoResponse || debitoResponse.debitos.length === 0) {
      return {
        valor_total: 0,
        valor_com_juros: 0,
        qtdParcelas:
          request.tipoPagamento === TipoPagamento.AVISTA
            ? 1
            : request.qtdParcelas || 0,
        valor_parcela: 0,
        saldo_restante: 0,
      };
    }

    const valor_total = debitoResponse.total;

    const taxa = request.taxa || 0;
    const valor_com_juros = +(valor_total + valor_total * taxa).toFixed(2);

    const qtdParcelas =
      request.tipoPagamento === TipoPagamento.AVISTA
        ? 1
        : request.qtdParcelas || 1;

    const valor_parcela = +(valor_com_juros / qtdParcelas).toFixed(2);

    const saldo_restante = valor_com_juros;

    return {
      valor_total,
      valor_com_juros,
      qtdParcelas,
      valor_parcela,
      saldo_restante,
    };
  }
}
