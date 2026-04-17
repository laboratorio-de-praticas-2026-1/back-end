import { ApiProperty } from '@nestjs/swagger';
import { RelatorioCategoria } from '../reports.service';

export class RelatorioCategoriaResponseDto {
  @ApiProperty({
    description: 'Nome amigável da categoria de relatório',
    example: 'Relatório Completo',
  })
  nome!: string;
  @ApiProperty({
    description: 'Valor da categoria de relatório (usado para identificação)',
    example: 'relatorio_completo',
  })
  valor!: RelatorioCategoria;

  constructor(nome: string, valor: RelatorioCategoria) {
    this.nome = nome;
    this.valor = valor;
  }
}
