import { ApiProperty } from '@nestjs/swagger';
import { StatusDebito } from 'src/models/debito.model';

export class DebitoItemDto {
  @ApiProperty({ example: 1 })
  declare id: number;

  @ApiProperty({ example: 'IPVA 2026' })
  declare descricao: string;

  @ApiProperty({ example: 1500.0 })
  declare valor: number;

  @ApiProperty({ enum: StatusDebito, example: StatusDebito.PENDENTE })
  declare status: StatusDebito;
}

export class DebitoResponseDto {
  @ApiProperty({ example: 'ABC1234' })
  declare placa: string;

  @ApiProperty({ type: [DebitoItemDto] })
  declare debitos: DebitoItemDto[];

  @ApiProperty({ example: 1800.0 })
  declare total: number;

  @ApiProperty({ example: 'Nenhum débito encontrado', required: false })
  declare mensagem?: string;
}
