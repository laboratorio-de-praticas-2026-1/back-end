import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Debito } from './debito.model';
import { Parcela } from './parcela.model';

@Table({ tableName: 'pagamento' })
export class Pagamento extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Debito)
  @Column({ field: 'id_debito', allowNull: false, unique: true })
  declare idDebito: number;

  @BelongsTo(() => Debito)
  declare debito: Debito;

  @Column({
    field: 'valor_total',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valorTotal: string;

  @Column({ field: 'qtd_parcelas', type: DataType.INTEGER, allowNull: false })
  declare qtdParcelas: number;

  @Column({
    field: 'tipo_pagamento',
    type: DataType.ENUM('avista', 'parcelado'),
    allowNull: false,
  })
  declare tipoPagamento: 'avista' | 'parcelado';

  @Column({
    field: 'metodo_pagamento',
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare metodoPagamento: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare taxa: string;

  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @HasMany(() => Parcela)
  declare parcelas: Parcela[];
}
