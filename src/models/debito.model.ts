import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { Pagamento } from './pagamento.model';
import { DebitoVeiculo } from './debito-veiculo.model';

/*Representa uma cobrança gerada para um cliente*/
@Table({ tableName: 'debito', timestamps: false })
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  /*Classifica se o débito veio de um serviço contratado ou de um veículo*/
  @Column({
    type: DataType.ENUM('servico', 'veiculo'),
    allowNull: false,
  })
  declare tipo: 'servico' | 'veiculo';

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  /*Valor base da cobrança (sem taxas/juros)*/
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare valor: number;

  /*Estado atual do débito*/
  @Column({
    type: DataType.ENUM('pago', 'pendente'),
    defaultValue: 'pendente',
  })
  declare status: 'pago' | 'pendente';

  /*Data de criação do débito*/
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  /*Quando o débito é quitado, um registro de Pagamento é criado*/
  @HasOne(() => Pagamento, { foreignKey: 'idDebito' })
  declare pagamento: Pagamento | null;

  @HasOne(() => DebitoVeiculo)
  declare debitoVeiculo: DebitoVeiculo;
}
