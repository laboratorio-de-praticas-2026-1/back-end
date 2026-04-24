import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Parcela } from './parcela.model';

export enum TipoPagamento {
  AVISTA = 'AVISTA',
  PARCELADO = 'PARCELADO',
}

@Table({ tableName: 'pagamento' })
export class Pagamento extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare id_debito: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare valor_total: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare qtd_parcelas: number;

  @Column({
    type: DataType.ENUM(...Object.values(TipoPagamento)),
    allowNull: false,
  })
  declare tipo_pagamento: TipoPagamento;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare metodo_pagamento: string;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: true })
  declare taxa?: number;

  @Column({ field: 'created_at', type: DataType.DATE, allowNull: true })
  declare createdAt: Date;

  @HasMany(() => Parcela)
  declare parcelas: Parcela[];
}