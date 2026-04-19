import { Column, DataType, HasOne, Model, Table } from 'sequelize-typescript';
import { DebitoServico } from './debito-servico.model';
import { DebitoVeiculo } from './debito-veiculo.model';
import { Pagamento } from './pagamento.model';

@Table({ tableName: 'debito' })
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    type: DataType.ENUM('servico', 'veiculo'),
    allowNull: false,
  })
  declare tipo: 'servico' | 'veiculo';

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valor: string;

  @Column({
    type: DataType.ENUM('pago', 'pendente'),
    allowNull: false,
    defaultValue: 'pendente',
  })
  declare status: 'pago' | 'pendente';

  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @HasOne(() => Pagamento)
  declare pagamento: Pagamento | null;

  @HasOne(() => DebitoServico)
  declare debitoServico: DebitoServico | null;

  @HasOne(() => DebitoVeiculo)
  declare debitoVeiculo: DebitoVeiculo | null;
}
