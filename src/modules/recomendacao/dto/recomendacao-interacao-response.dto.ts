import { ApiProperty } from '@nestjs/swagger';
import { RecomendacaoCategoriaBlogEnum } from '../enums/recomendacao-categoria-blog.enum';

// DTO de resposta da API da rota POST
export class RecomendacaoInteracaoResponseDto {
  @ApiProperty({ example: 1, description: 'Id da interação registrada' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Id do usuário da interação' })
  usuarioId!: number;

  @ApiProperty({
    example: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
    enum: RecomendacaoCategoriaBlogEnum,
    description: 'Categoria do blog associada à interação',
  })
  categoriaBlog!: RecomendacaoCategoriaBlogEnum;

  @ApiProperty({
    example: '2024-05-20',
    description: 'Data da interação no formato YYYY-MM-DD',
  })
  dataInteracao!: string;
}
