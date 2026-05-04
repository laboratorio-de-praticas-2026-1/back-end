import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.model';
import { Solicitacao } from './solicitacao.model';
import { DebitoVeiculo } from './debito-veiculo.model';

@Table({ tableName: 'veiculo' })
export class Veiculo extends Model {
  @ApiProperty({ example: 1, description: 'ID do veículo' })
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ApiProperty({ example: 1, description: 'ID do usuário proprietário' })
  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id', allowNull: false })
  declare usuarioId: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @ApiProperty({ example: 'ABC-1234', description: 'Placa do veículo' })
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare placa: string;

  @ApiProperty({
    example: '12345678901',
    nullable: true,
    description: 'Renavam do veículo',
  })
  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare renavam: string | null;

  @ApiProperty({
    example: 'Toyota',
    nullable: true,
    description: 'Marca do veículo',
  })
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare marca: string | null;

  @ApiProperty({
    example: 'Corolla',
    nullable: true,
    description: 'Modelo do veículo',
  })
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare modelo: string | null;

  @ApiProperty({
    example: 2020,
    nullable: true,
    description: 'Ano de fabricação',
  })
  @Column({
    field: 'ano_fabricacao',
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare anoFabricacao: number | null;

  @ApiProperty({
    example: 2020,
    nullable: true,
    description: 'Ano modelo',
  })
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
