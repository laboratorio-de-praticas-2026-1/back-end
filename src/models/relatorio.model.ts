import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum RelatorioCategoria {
  RELATORIO_COMPLETO = 'relatorio_completo',
  PERFORMANCE_FINANCEIRA = 'performance_financeira',
  DESEMPENHO_OPERACIONAL = 'desempenho_operacional',
  PERFORMANCE_SERVICOS = 'performance_servicos',
  GESTAO_SOLICITACOES = 'gestao_solicitacoes',
  GESTAO_DOCUMENTOS = 'gestao_documentos',
  GESTAO_VEICULOS = 'gestao_veiculos',
  BASE_CLIENTES = 'base_clientes',
  ANALISE_EFICIENCIA = 'analise_eficiencia',
  FUNIL_CONVERSAO = 'funil_conversao',
  GARGALOS_OPERACIONAIS = 'gargalos_operacionais',
}

@Table({
  tableName: 'relatorio',
  createdAt: false,
  updatedAt: false,
})
export class Relatorio extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(RelatorioCategoria)),
    allowNull: false,
    defaultValue: RelatorioCategoria.RELATORIO_COMPLETO,
  })
  declare categoria: RelatorioCategoria;

  @Column({
    field: 'url_documento_hash',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare urlDocumentoHash: string;

  @Column({
    field: 'data_geracao',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare dataGeracao: Date;

  @Column({
    field: 'periodo_inicio',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare periodoInicio: Date;

  @Column({
    field: 'periodo_fim',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare periodoFim: Date;
}
