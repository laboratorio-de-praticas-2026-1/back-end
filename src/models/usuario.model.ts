import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'usuario',
  createdAt: false,
  updatedAt: false,
})
export class Usuario extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @Column({ unique: true, type: DataType.STRING(100), allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare senha: string;

  @Column({
    type: DataType.ENUM('cliente', 'administrador'),
    defaultValue: 'cliente',
  })
  declare nivel: 'cliente' | 'administrador';

  @Column({ field: 'cpf_cnpj', type: DataType.STRING(20), allowNull: true })
  declare cpfCnpj: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare celular: string | null;

  @Column({
    field: 'data_cadastro',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare dataCadastro: Date;
}
