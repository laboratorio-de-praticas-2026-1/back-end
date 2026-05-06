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

  @ForeignKey(() => Debito)
  @Column({ field: 'id_debito', allowNull: false, unique: true })
  declare idDebito: number;

  @BelongsTo(() => Debito)
  declare debito: Debito;

  @ForeignKey(() => Veiculo)
  @Column({ field: 'id_veiculo', allowNull: false })
  declare idVeiculo: number;

  @BelongsTo(() => Veiculo)
  declare veiculo: Veiculo;
}
