import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { DebitoServico } from './debito-servico.model';
import { DebitoVeiculo } from './debito-veiculo.model';
import { Pagamento } from './pagamento.model';
import { Solicitacao } from './solicitacao.model';

export enum TipoDebito {
  VEICULO = 'veiculo',
  SERVICO = 'servico',
}

export enum StatusDebito {
  PAGO = 'pago',
  PENDENTE = 'pendente',
}


@Table({ tableName: 'debito' })
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  /*Classifica se o débito veio de um serviço contratado ou de um veículo*/
  @Column({
    type: DataType.ENUM(...Object.values(TipoDebito)),
    allowNull: false,
  })
  declare tipo: TipoDebito;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare descricao: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valor: number;

  /*Estado atual do débito*/
  @Column({
    type: DataType.ENUM(...Object.values(StatusDebito)),
    allowNull: false,
  })
  declare status: StatusDebito;

  /*Data de criação do débito*/
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    allowNull: true,
  })
  declare createdAt: Date;

  //@HasMany(() => DebitoVeiculo)
  //declare debitoVeiculos: DebitoVeiculo[];

  @ForeignKey(() => Solicitacao)
  @Column({ field: 'solicitacao_id', type: DataType.INTEGER, allowNull: false })
  declare solicitacaoId: number;

  @BelongsTo(() => Solicitacao)
  declare solicitacao: Solicitacao;

  @HasOne(() => Pagamento)
  declare pagamento: Pagamento | null;

  @HasOne(() => DebitoServico)
  declare debitoServico: DebitoServico | null;

  @HasOne(() => DebitoVeiculo)
  declare debitoVeiculo: DebitoVeiculo | null;
}
