import {
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

@Table({ tableName: 'parcela' })
export class Parcela extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Pagamento)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_pagamento: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare valor: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare numero_parcela: number;

  @Column({
    type: DataType.ENUM(...Object.values(StatusParcela)),
    allowNull: false,
  })
  declare status: StatusParcela;
}
