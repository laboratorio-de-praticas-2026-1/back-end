import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'faq' })
export class Faq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare pergunta: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare resposta: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare categoria: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  declare status: boolean;
}
