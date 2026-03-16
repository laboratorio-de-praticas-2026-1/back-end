import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Servico } from './servico.model';
import { Usuario } from './usuario.model';
import { Veiculo } from './veiculo.model';

@Table({ tableName: 'solicitacao' })
export class Solicitacao extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id', allowNull: false })
  declare usuarioId: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @ForeignKey(() => Veiculo)
  @Column({ field: 'veiculo_id', type: DataType.INTEGER, allowNull: true })
  declare veiculoId: number | null;

  @BelongsTo(() => Veiculo)
  declare veiculo: Veiculo | null;

  @ForeignKey(() => Servico)
  @Column({ field: 'servico_id', allowNull: false })
  declare servicoId: number;

  @BelongsTo(() => Servico)
  declare servico: Servico;

  @Column({
    type: DataType.ENUM(
      'recebido',
      'aguardando_pagamento',
      'aguardando_documento',
      'em_andamento',
      'concluido',
      'cancelado',
    ),
    defaultValue: 'recebido',
  })
  declare status:
    | 'recebido'
    | 'aguardando_pagamento'
    | 'aguardando_documento'
    | 'em_andamento'
    | 'concluido'
    | 'cancelado';

  @Column({
    field: 'observacao_cliente',
    type: DataType.TEXT,
    allowNull: true,
  })
  declare observacaoCliente: string | null;

  @Column({
    field: 'observacao_admin',
    type: DataType.TEXT,
    allowNull: true,
  })
  declare observacaoAdmin: string | null;

  @Column({
    field: 'data_solicitacao',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare dataSolicitacao: Date;

  @Column({
    field: 'data_conclusao',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataConclusao: Date | null;
}
