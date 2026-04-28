import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Solicitacao } from './solicitacao.model';

@Table({ tableName: 'documento_solicitacao' })
export class DocumentoSolicitacao extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Solicitacao)
  @Column({ field: 'solicitacao_id', allowNull: false })
  declare solicitacaoId: number;

  @BelongsTo(() => Solicitacao)
  declare solicitacao: Solicitacao;

  @Column({ field: 'nome_hash', type: DataType.STRING(255), allowNull: true })
  declare nomeHash: string | null;

  @Column({
    field: 'tipo_documento',
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare tipoDocumento: string | null;

  @Column({
    field: 'status_validacao',
    type: 'ENUM',
    values: ['pendente', 'aprovado', 'rejeitado'],
    defaultValue: 'pendente',
  })
  declare statusValidacao: 'pendente' | 'aprovado' | 'rejeitado';

  @Column({ field: 'data_upload', type: DataType.DATE, allowNull: true })
  declare dataUpload: Date | null;
}
