import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { DebitoVeiculo } from './debito-veiculo.model';

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

  @Column({
    type: DataType.ENUM(...Object.values(StatusDebito)),
    allowNull: false,
  })
  declare status: StatusDebito;

  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: true,
  })
  declare createdAt: Date;

  @HasMany(() => DebitoVeiculo)
  declare debitoVeiculos: DebitoVeiculo[];
}
