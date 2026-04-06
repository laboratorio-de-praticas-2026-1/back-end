import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'empresa' })
export class Empresa extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    field: 'nome_fantasia',
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare nomeFantasia: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare cnpj: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare telefone: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare endereco: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare cidade: string | null;

  @Column({ type: DataType.STRING(2), allowNull: true })
  declare estado: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare site: string | null;
}
