import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { DebitoVeiculo } from './debito-veiculo.model';

@Table({ tableName: 'debito' })
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare descricao: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valor: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare status: string;

  @HasMany(() => DebitoVeiculo)
  declare debitoVeiculos: DebitoVeiculo[];
}