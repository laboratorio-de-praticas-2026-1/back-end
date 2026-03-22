import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'banner' })
export class Banner extends Model {
  @ApiProperty({ description: 'ID do banner', example: 1 })
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ApiProperty({ description: 'URL da imagem do banner', example: 'https://example.com/banner.jpg' })
  @Column({
    field: 'url_imagem',
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare urlImagem: string | null;

  @ApiProperty({ description: 'Descrição do banner', example: 'Banner promocional' })
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare descricao: string | null;

  @ApiProperty({ description: 'Status do banner', example: true })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: true,
  })
  declare ativo: boolean | null;
}
