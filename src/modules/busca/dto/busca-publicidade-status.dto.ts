import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

export class BuscaPublicidadeStatusDto {
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  declare status: 'ativo' | 'inativo';
}
