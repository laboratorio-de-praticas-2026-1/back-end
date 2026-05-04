import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Usuario } from './usuario.model';
import { Solicitacao } from './solicitacao.model';
import { DebitoVeiculo } from './debito-veiculo.model';

@Table({ tableName: 'veiculo' })
export class Veiculo extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id', allowNull: false })
  declare usuarioId: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare placa: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare renavam: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare marca: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare modelo: string | null;

  @Column({
    field: 'ano_fabricacao',
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare anoFabricacao: number | null;

  @Column({
    field: 'ano_modelo',
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare anoModelo: number | null;

  @HasMany(() => Solicitacao)
  declare solicitacoes: Solicitacao[];

  @HasMany(() => DebitoVeiculo)
  declare debitoVeiculos: DebitoVeiculo[];
}
