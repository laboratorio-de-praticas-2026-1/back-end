import { ApiProperty } from '@nestjs/swagger';

// DTO de resposta da API da rota GET
export class RecomendacaoRespostaDto {
  @ApiProperty({
    example: 7,
    description: 'ID identificador do serviço',
  })
  id!: number;

  @ApiProperty({
    example: 'Licenciamento Anual (CRLV-e)',
    description: 'Nome do serviço automotivo',
  })
  nome!: string;

  @ApiProperty({
    example:
      'Processo de renovação do documento do veículo para circulação regular.',
    description: 'Descrição detalhada para o usuário',
  })
  descricao!: string;

  @ApiProperty({
    example: true,
    description: 'Status do serviço no catálogo',
  })
  ativo!: boolean;
}
