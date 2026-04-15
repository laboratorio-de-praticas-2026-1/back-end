import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Pagamento } from './pagamento.model';

/*Representa uma parcela individual de um Pagamento parcelado*/
@Table({ tableName: 'parcela', timestamps: false })
export class Parcela extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Pagamento)
  @Column({ field: 'id_pagamento', allowNull: false })
  declare idPagamento: number;

  @BelongsTo(() => Pagamento)
  declare pagamento: Pagamento;

  /** Valor desta parcela específica. */
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare valor: number;

  @Column({
    field: 'numero_parcela',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare numeroParcela: number;

  /*Estado da parcela*/
  @Column({
    type: DataType.ENUM('pago', 'atrasado', 'ativo'),
    defaultValue: 'ativo',
  })
  declare status: 'pago' | 'atrasado' | 'ativo';

  /*Data de vencimento desta parcela*/
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare vencimento: Date;
}
