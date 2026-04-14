/* eslint-disable prettier/prettier */
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'faq' })
export class Faq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare pergunta: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare resposta: string | null;

  @Column({ type: DataType.STRING, allowNull: false })
  declare categoria: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
} 