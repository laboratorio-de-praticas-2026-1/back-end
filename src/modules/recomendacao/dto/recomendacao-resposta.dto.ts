import { ApiProperty } from '@nestjs/swagger';

// DTO de resposta da API da rota GET
export class RecomendacaoRespostaDto {
  @ApiProperty({
    example: 1,
    description: 'ID identificador do serviço',
  })
  id!: number;

  @ApiProperty({
    example: 'Licenciamento Anual',
    description: 'Nome do serviço automotivo',
  })
  nome!: string;

  @ApiProperty({
    example:
      'O veículo de placa ABC1D23 já está no período de licenciamento. Faça o licenciamento anual para evitar multas.',
    description: 'Descrição detalhada para o usuário',
  })
  descricao!: string;
}
