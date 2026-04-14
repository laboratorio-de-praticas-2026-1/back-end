import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Debito } from './debito.model';
import { Servico } from './servico.model';

@Table({ tableName: 'debito_servico', timestamps: false })
export class DebitoServico extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Debito)
  @Column({ field: 'id_debito', allowNull: false })
  declare idDebito: number;

  @BelongsTo(() => Debito)
  declare debito: Debito;

  @ForeignKey(() => Servico)
  @Column({ field: 'id_servico', allowNull: false })
  declare idServico: number;

  @BelongsTo(() => Servico)
  declare servico: Servico;
}