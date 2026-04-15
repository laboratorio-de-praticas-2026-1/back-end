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
  nome!: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'O valor base é obrigatório' })
  valor_base!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'O prazo estimado é obrigatório' })
  prazo_estimado_dias!: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsBoolean()
  @IsOptional()
  exige_veiculo?: boolean;
}
