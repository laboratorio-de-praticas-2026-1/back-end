import { Column, DataType, HasMany, Model, Table, ForeignKey, BelongsTo, } from 'sequelize-typescript';
import { Parcela } from './parcela.model';
import { Debito } from './debito.model';

export enum TipoPagamento {
  AVISTA = 'AVISTA',
  PARCELADO = 'PARCELADO',
}

@Table({ tableName: 'pagamento', timestamps: false })
export class Pagamento extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Debito)
  @Column({ field: 'id_debito', allowNull: false, unique: true })
  declare idDebito: number;
  @BelongsTo(() => Debito)
  declare debito: Debito;


  /* Valor total efetivamente cobrado (valor original + taxa)*/
  @Column({
    field: 'valor_total',
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valorTotal: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare qtd_parcelas: number;
  /*Número de parcelas*/
  @Column({
    field: 'qtd_parcelas',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare qtdParcelas: number;

  @Column({
    field: 'tipo_pagamento',
    type: DataType.ENUM(...Object.values(TipoPagamento)),
    allowNull: false,
  })
  declare tipoPagamento: TipoPagamento;

  /*Canal de pagamento (pix, boleto, cartao, etc.)*/
  @Column({
    field: 'metodo_pagamento',
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare metodoPagamento: string;

  /*Valor cobrado de juros/multa nesta transação*/
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  declare taxa: number;

  /*Data em que o pagamento foi registrado*/
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  /*Parcelas geradas por este pagamento*/
  @HasMany(() => Parcela, { foreignKey: 'idPagamento' })
  declare parcelas: Parcela[];
}
