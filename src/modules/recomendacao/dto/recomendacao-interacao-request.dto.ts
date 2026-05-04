import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt } from 'class-validator';
import { RecomendacaoCategoriaBlogEnum } from '../enums/recomendacao-categoria-blog.enum';

// DTO de request da rota POST
export class RecomendacaoInteracaoRequestDto {
  @ApiProperty({
    example: 1,
    description: 'ID do usuário logado',
  })
  @IsInt()
  usuarioId!: number;

  @ApiProperty({
    example: 'Documentacao',
    enum: RecomendacaoCategoriaBlogEnum,
  })
  @IsEnum(RecomendacaoCategoriaBlogEnum)
  categoriaBlog!: RecomendacaoCategoriaBlogEnum;

  @ApiProperty({ example: '2024-05-20' })
  @IsDateString()
  dataInteracao!: string;
}
