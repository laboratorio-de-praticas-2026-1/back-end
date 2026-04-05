import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'emails_enviados', timestamps: false })
export class EmailEnviado extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({
    field: 'nome_usuario',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare nomeUsuario: string;

  @Column({
    field: 'email_usuario',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare emailUsuario: string;

  @Column({
    field: 'texto_digitado',
    type: DataType.TEXT,
    allowNull: false,
  })
  declare textoDigitado: string;

  @Column({
    field: 'assunto',
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare assunto: string;

  @Column({
    field: 'data_envio',
    type: DataType.DATE(3),
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare dataEnvio: Date;
}
