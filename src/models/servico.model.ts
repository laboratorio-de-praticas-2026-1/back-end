import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Solicitacao } from './solicitacao.model';
import { DebitoServico } from './debito-servico.model';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Table({ tableName: 'servico' })
export class Servico extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Troca de óleo',
    maxLength: 100,
  })
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do serviço',
    example: 'Troca completa de óleo do motor',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare descricao: string | null;

  @ApiPropertyOptional({
    description: 'Valor base do serviço em reais',
    example: 149.9,
  })
  @Column({
    field: 'valor_base',
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare valorBase: number | null;

  @ApiPropertyOptional({
    description: 'Prazo estimado para conclusão em dias',
    example: 1,
  })
  @Column({
    field: 'prazo_estimado_dias',
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare prazoEstimadoDias: number | null;

  @ApiPropertyOptional({
    description: 'Indica se o serviço está ativo',
    example: true,
    default: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  })
  declare ativo: boolean | null;

  @HasMany(() => Solicitacao)
  declare solicitacoes: Solicitacao[];

  @HasMany(() => DebitoServico)
  declare debitoServicos: DebitoServico[];

  @ApiPropertyOptional({
    description: 'Indica se o serviço exige vínculo com veículo',
    example: false,
    default: false,
  })
  @Column({
    field: 'exige_veiculo',
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  declare exigeVeiculo: boolean | null;
}
