import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscaBannerStatusDto {
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  @ApiPropertyOptional({
    description: 'Status do banner',
    example: 'ativo',
    type: String,
  })
  declare status: 'ativo' | 'inativo';
}
