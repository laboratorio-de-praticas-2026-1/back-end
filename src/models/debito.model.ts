import {
  Column,
  DataType,
  Model,
  Table,
  BelongsToMany,
} from 'sequelize-typescript';
import { Veiculo } from './veiculo.model';
import { DebitoVeiculo } from './debito-veiculo.model';

@Table({
  tableName: 'debito',
  underscored: true,
  timestamps: true,
  updatedAt: false,
})
export class Debito extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    type: DataType.ENUM('servico', 'veiculo'),
    allowNull: false,
  })
  declare tipo: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare descricao: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare valor: number | null;

  @Column({
    type: DataType.ENUM('pago', 'pendente'),
    allowNull: false,
    defaultValue: 'pendente',
  })
  declare status: string;

  @Column({
    field: 'created_at',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @BelongsToMany(() => Veiculo, () => DebitoVeiculo)
  declare veiculos: Veiculo[];
}
