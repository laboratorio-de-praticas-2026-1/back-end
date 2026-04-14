import {
  Column,
  DataType,
  Model,
  Table,
  ForeignKey,
} from 'sequelize-typescript';
import { Veiculo } from './veiculo.model';
import { Debito } from './debito.model';

@Table({ tableName: 'debito_veiculo' })
export class DebitoVeiculo extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Debito)
  @Column({
    field: 'id_debito',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare debitoId: number;

  @ForeignKey(() => Veiculo)
  @Column({
    field: 'id_veiculo',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare veiculoId: number;
}
