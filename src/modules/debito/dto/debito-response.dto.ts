import { ApiProperty } from '@nestjs/swagger';
import { StatusDebito } from '../../../models/debito.model';

export class DebitoItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'IPVA 2026' })
  descricao: string;

  @ApiProperty({ example: 1500.0 })
  valor: number;

  @ApiProperty({ enum: StatusDebito, example: StatusDebito.PENDENTE })
  status: StatusDebito;
}

export class DebitoResponseDto {
  @ApiProperty({ example: 'ABC1234' })
  placa: string;

  @ApiProperty({ type: [DebitoItemDto] })
  debitos: DebitoItemDto[];

  @ApiProperty({ example: 1800.0 })
  total: number;
}
