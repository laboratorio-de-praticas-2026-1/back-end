import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'faq' })
export class Faq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare pergunta: string | null;

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
}
