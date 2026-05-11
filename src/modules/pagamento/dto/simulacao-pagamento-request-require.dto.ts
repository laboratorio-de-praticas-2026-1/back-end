import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TipoPagamento } from 'src/models/pagamento.model';

export class SimulacaoPagamentoRequestDto {
  @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo' })
  @IsString()
  @IsNotEmpty()
  placa!: string;

  @ApiPropertyOptional({
    example: 6,
    description: 'Quantidade de parcelas (se parcelado)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  qtdParcelas?: number;

  @ApiPropertyOptional({
    example: 0.05,
    description: 'Taxa aplicada sobre o valor total',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxa?: number;

  @ApiProperty({ enum: TipoPagamento, example: TipoPagamento.PARCELADO })
  @IsEnum(TipoPagamento)
  tipoPagamento!: TipoPagamento;
}

export class SimulacaoPagamentoResponseDto {
  @ApiPropertyOptional({
    example: 'Nenhum debito encontrado para o veiculo informado.',
  })
  mensagem?: string;

  @ApiProperty({ example: 1500.0, description: 'Valor total dos débitos' })
  valor_total!: number;

  @ApiProperty({
    example: 1575.0,
    description: 'Valor total com taxa aplicada',
  })
  valor_com_juros!: number;

  @ApiProperty({ example: 6, description: 'Quantidade de parcelas simuladas' })
  qtdParcelas!: number;

  @ApiProperty({ example: 262.5, description: 'Valor de cada parcela' })
  valor_parcela!: number;

  @ApiProperty({
    example: 1575.0,
    description: 'Saldo restante após simulação',
  })
  saldo_restante!: number;
}
