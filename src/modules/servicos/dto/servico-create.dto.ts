import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório' })
  @MaxLength(100)
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Troca de óleo',
    maxLength: 100,
  })
  nome!: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do serviço',
    example: 'Troca completa de óleo do motor',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Valor base do serviço em reais',
    example: 149.9,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'O valor base é obrigatório' })
  valor_base!: number;

  @ApiPropertyOptional({
    description: 'Prazo estimado para conclusão em dias',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'O prazo estimado é obrigatório' })
  prazo_estimado_dias!: number;

  @ApiPropertyOptional({
    description: 'Indica se o serviço está ativo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se o serviço exige vínculo com veículo',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  exige_veiculo?: boolean;
}
