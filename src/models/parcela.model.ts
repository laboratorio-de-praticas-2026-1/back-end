import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Pagamento } from './pagamento.model';

export enum StatusParcela {
  PENDENTE = 'pendente',
  PAGA = 'paga',
  ATRASADA = 'atrasada',
}

@Table({ tableName: 'parcela', timestamps: false })
export class Parcela extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Pagamento)
  @Column({ field: 'id_pagamento', type: DataType.INTEGER, allowNull: false })
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
    type: DataType.ENUM(...Object.values(StatusParcela)),
    allowNull: false,
  })
  declare status: StatusParcela;

  /*Data de vencimento desta parcela*/
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare vencimento: Date;
}
