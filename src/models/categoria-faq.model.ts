import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { Faq } from './faq.model';

@Table({ tableName: 'categoria_faq' })
export class CategoriaFaq extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare documentacao: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare regularizacao: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare manutencao: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare outros: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare frequentes: string;

  @HasMany(() => Faq)
  declare faqs: Faq[];
}