import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { CategoriaFaq } from './categoria-faq.model';

@Table({ tableName: 'faq' })
export class Faq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare pergunta: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare resposta: string | null;

  @ForeignKey(() => CategoriaFaq)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare categoriaId: number;

  @BelongsTo(() => CategoriaFaq)
  declare categoria: CategoriaFaq;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare status: boolean;
}