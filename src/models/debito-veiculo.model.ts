import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Debito } from './debito.model';
import { Veiculo } from './veiculo.model';

@Table({ tableName: 'debito_veiculo' })
export class DebitoVeiculo extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Veiculo)
  @Column({ field: 'veiculo_id', allowNull: false })
  declare veiculoId: number;

  @BelongsTo(() => Veiculo)
  declare veiculo: Veiculo;

  @ForeignKey(() => Debito)
  @Column({ field: 'debito_id', allowNull: false })
  declare debitoId: number;

  @BelongsTo(() => Debito)
  declare debito: Debito;
}
