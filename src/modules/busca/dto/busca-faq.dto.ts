import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CategoriaFaqEnum } from 'src/models/faq.model';

export class BuscaFaqDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @IsString()
  @ApiPropertyOptional({
    description: 'Termo de busca por pergunta, resposta ou categoria',
    example: 'cnh',
    type: String,
  })
  declare termo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  @ApiPropertyOptional({
    description: 'Status do FAQ',
    example: 'ativo',
    enum: ['ativo', 'inativo'],
  })
  declare status?: 'ativo' | 'inativo';

  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | undefined =>
    typeof value === 'string' ? value.trim().toLowerCase() : undefined,
  )
  @IsString()
  @IsIn(Object.values(CategoriaFaqEnum), {
    message: `Campo "categoria" deve ser um dos valores: ${Object.values(CategoriaFaqEnum).join(', ')}`,
  })
  @ApiPropertyOptional({
    description: 'Categoria do FAQ',
    example: 'detran',
    enum: Object.values(CategoriaFaqEnum),
  })
  declare categoria?: (typeof CategoriaFaqEnum)[keyof typeof CategoriaFaqEnum];
}
