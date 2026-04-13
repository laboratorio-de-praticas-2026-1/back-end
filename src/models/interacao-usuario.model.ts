import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { RecomendacaoCategoriaBlogEnum } from 'src/modules/recomendacao/enums/recomendacao-categoria-blog.enum';
import { Usuario } from './usuario.model';

@Table({ tableName: 'interacao_usuario' })
export class InteracaoUsuario extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id', allowNull: false })
  declare usuarioId: number;

  @BelongsTo(() => Usuario)
  declare usuario: Usuario;

  @Column({
    field: 'categoria_blog',
    type: DataType.ENUM(
      RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
      RecomendacaoCategoriaBlogEnum.DEBITOS,
      RecomendacaoCategoriaBlogEnum.MULTAS,
      RecomendacaoCategoriaBlogEnum.LEGISLACAO,
      RecomendacaoCategoriaBlogEnum.CONDUTOR,
    ),
    allowNull: false,
  })
  declare categoriaBlog: RecomendacaoCategoriaBlogEnum;

  @Column({
    field: 'data_interacao',
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare dataInteracao: Date;
}
