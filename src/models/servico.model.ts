import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'servico' })
export class Servico extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({
    field: 'valor_base',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare valorBase: number | null;

  @Column({
    field: 'prazo_estimado_dias',
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare prazoEstimadoDias: number | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  declare ativo: boolean | null;
}
