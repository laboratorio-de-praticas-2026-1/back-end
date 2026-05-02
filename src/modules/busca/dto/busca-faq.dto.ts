import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

const CATEGORIAS_FAQ = ['Novidades', 'CNH', 'Detran', 'Leis', 'Ipva'] as const;

function normalizarCategoria(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const categoria = value.trim().toLowerCase();

  const mapaCategorias: Record<string, (typeof CATEGORIAS_FAQ)[number]> = {
    novidades: 'Novidades',
    cnh: 'CNH',
    detran: 'Detran',
    leis: 'Leis',
    ipva: 'Ipva',
  };

  return mapaCategorias[categoria] ?? value;
}

export class BuscaFaqDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  declare termo?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  declare status?: 'ativo' | 'inativo';

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => normalizarCategoria(value))
  @IsString()
  @IsIn(CATEGORIAS_FAQ, {
    message:
      'Campo "categoria" deve ser um dos valores: Novidades, CNH, Detran, Leis ou Ipva',
  })
  declare categoria?: (typeof CATEGORIAS_FAQ)[number];
}
