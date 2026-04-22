import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Pagamento } from './pagamento.model';

@Table({ tableName: 'parcela' })
export class Parcela extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Pagamento)
  @Column({ field: 'id_pagamento', allowNull: false })
  declare idPagamento: number;

  @BelongsTo(() => Pagamento)
  declare pagamento: Pagamento;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valor: string;

  @Column({
    field: 'numero_parcela',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare numeroParcela: number;

  @Column({
    type: DataType.ENUM('pago', 'atrasado', 'ativo'),
    allowNull: false,
    defaultValue: 'ativo',
  })
  declare status: 'pago' | 'atrasado' | 'ativo';

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare vencimento: Date;
}
