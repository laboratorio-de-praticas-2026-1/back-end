import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { DebitoVeiculo } from './debito-veiculo.model';

@Table({ tableName: 'debito' })
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    type: DataType.ENUM('servico', 'veiculo'),
    allowNull: false,
  })
  declare tipo: 'servico' | 'veiculo';

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare valor: number;

  @Column({
    type: DataType.ENUM('pago', 'pendente'),
    defaultValue: 'pendente',
  })
  declare status: 'pago' | 'pendente';

  @HasOne(() => DebitoVeiculo)
  declare debitoVeiculo: DebitoVeiculo;
}
