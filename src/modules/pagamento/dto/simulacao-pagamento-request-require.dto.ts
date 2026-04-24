import { ApiProperty } from '@nestjs/swagger';
import { TipoPagamento } from 'src/models/pagamento.model';


export class SimulacaoPagamentoRequestDto {
  @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo' })
  placa!: string;

  @ApiProperty({ example: 6, description: 'Quantidade de parcelas (se parcelado)', required: false })
  qtdParcelas?: number;

  @ApiProperty({ example: 0.05, description: 'Taxa aplicada sobre o valor total', required: false })
  taxa?: number;

  @ApiProperty({ enum: TipoPagamento, example: TipoPagamento.PARCELADO })
  tipoPagamento!: TipoPagamento;
}

export class SimulacaoPagamentoResponseDto {
  @ApiProperty({ example: 1500.00, description: 'Valor total dos débitos' })
  valor_total!: number;

  @ApiProperty({ example: 1575.00, description: 'Valor total com taxa aplicada' })
  valor_com_juros!: number;

  @ApiProperty({ example: 6, description: 'Quantidade de parcelas simuladas' })
  qtdParcelas!: number;

  @ApiProperty({ example: 262.50, description: 'Valor de cada parcela' })
  valor_parcela!: number;

  @ApiProperty({ example: 1575.00, description: 'Saldo restante após simulação' })
  saldo_restante!: number;
}
