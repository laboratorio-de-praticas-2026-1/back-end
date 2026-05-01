import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VeiculoCreateDto {
  @ApiProperty({ example: 1, description: 'ID do usuário proprietário' })
  @IsInt()
  usuarioId!: number;

  @ApiProperty({ example: 'ABC-1234', description: 'Placa do veículo' })
  @IsString()
  placa!: string;

  @ApiProperty({
    example: '12345678901',
    required: false,
    nullable: true,
    description: 'Renavam do veículo',
  })
  @IsOptional()
  @IsString()
  renavam?: string;

  @ApiProperty({
    example: 'Toyota',
    required: false,
    nullable: true,
    description: 'Marca do veículo',
  })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({
    example: 'Corolla',
    required: false,
    nullable: true,
    description: 'Modelo do veículo',
  })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiProperty({
    example: 2020,
    required: false,
    nullable: true,
    description: 'Ano de fabricação',
  })
  @IsOptional()
  @IsInt()
  anoFabricacao?: number;

  @ApiProperty({
    example: 2021,
    required: false,
    nullable: true,
    description: 'Ano do modelo',
  })
  @IsOptional()
  @IsInt()
  anoModelo?: number;
}
