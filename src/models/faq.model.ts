import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum CategoriaFaqEnum {
  DOCUMENTACAO = 'documentacao',
  REGULARIZACAO = 'regularizacao',
  MANUTENCAO = 'manutencao',
  OUTROS = 'outros',
  FREQUENTES = 'frequentes',
}

@Table({ tableName: 'faq' })
export class Faq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare pergunta: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare resposta: string;

  @Column({
    type: DataType.ENUM(...Object.values(CategoriaFaqEnum)),
    allowNull: false,
  })
  declare categoria: CategoriaFaqEnum;

<<<<<<< 305-3-feature-criação-das-rotas-de-busca-simples-e-avançada-para-o-cms-de-faq-e-solicitações
  @Column({ type: DataType.TEXT, allowNull: true })
  declare resposta: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare ativo: boolean;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare categoria: string | null;
=======
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
>>>>>>> release/entrega-04-05
}
