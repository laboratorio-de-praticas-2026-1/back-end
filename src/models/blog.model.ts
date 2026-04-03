import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum CategoriaBlog {
  Documentacao = 'Documentacao',
}

@Table({ tableName: 'blog' })
export class Blog extends Model {
  @ApiProperty({ description: 'Id do Post de blog', example: 1 })
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ApiProperty({
    description: 'Título do Post',
    example: 'Calendário IPVA 2026',
  })
  @Column({ type: DataType.STRING(150), allowNull: true })
  declare titulo: string | null;

  @ApiProperty({
    description: 'Conteúdo do Post',
    example: 'Confira as datas de vencimento do IPVA por final de placa...',
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  declare conteudo: string | null;

  @ApiProperty({
    description: 'Data de publicação do Post',
    example: '2026-01-10',
  })
  @Column({
    field: 'data_publicacao',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataPublicacao: Date | null;

  @ApiProperty({
    description: 'Url da imagem do Post',
    example: 'https://img.com/blog1.jpg',
  })
  @Column({
    field: 'url_imagem',
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare urlImagem: string | null;

  @ApiProperty({
    description: 'Status do post',
    example: true,
    default: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare ativo: boolean;

  @ApiProperty({
    description: 'Resumo do conteúdo',
    example: 'Resumo do post',
    required: false,
    nullable: true,
  })
  @Column({
    field: 'olho_do_texto',
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare olhoDoTexto: string | null;

  @ApiProperty({
    description: 'Categoria do post',
    example: CategoriaBlog.Documentacao,
    enum: CategoriaBlog,
    default: CategoriaBlog.Documentacao,
  })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: CategoriaBlog.Documentacao,
  })
  declare categoria: CategoriaBlog;
}
