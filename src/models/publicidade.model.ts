import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'publicidade' })
export class Publicidade extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare titulo: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare conteudo: string | null;

  @Column({ field: 'url_imagem', type: DataType.STRING(255), allowNull: true })
  declare urlImagem: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare ativo: boolean;
}
