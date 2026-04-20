import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Debito } from './debito.model';
import { Solicitacao } from './solicitacao.model';

@Table({ tableName: 'debitoSolicitacao' })
export class DebitoSolicitacao extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Debito)
  @Column({ field: 'id_debito', allowNull: false, unique: true })
  declare idDebito: number;

  @BelongsTo(() => Debito)
  declare debito: Debito;

  @ForeignKey(() => Solicitacao)
  @Column({ field: 'id_solicitacao', allowNull: false, unique: true })
  declare idSolicitacao: number;

  @BelongsTo(() => Solicitacao)
  declare solicitacao: Solicitacao;
}
