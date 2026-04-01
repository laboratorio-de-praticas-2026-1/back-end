import {
  BelongsTo, Column, DataType, ForeignKey, Model, Table,
} from 'sequelize-typescript'; 
import { Usuario } from './usuario.model';

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
  
  @Column({
    field: 'data_licenciamento_vencimento',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataLicenciamentoVencimento: Date | null;

  @Column({
    field: 'data_licenciamento_renovacao',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataLicenciamentoRenovacao: Date | null;

  @Column({
    field: 'valor_debito_total',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  })
  declare valorDebitoTotal: number | null;

  @Column({
    field: 'possui_debitos',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare possuiDebitos: boolean;

  @Column({
    field: 'data_ultimo_debito',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataUltimoDebito: Date | null;
}
