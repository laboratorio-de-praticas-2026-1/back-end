import { Column, Model, Table, DataType } from 'sequelize-typescript';

// atributos do banco
interface EmailEnviadoAttributes {
  id: number;
  nome_usuario: string;
  email_usuario: string;
  texto_digitado: string;
  assunto: string;
  data_envio: Date;
}

// atributos para criação (sem id)
interface EmailEnviadoCreationAttributes extends Omit<
  EmailEnviadoAttributes,
  'id'
> {}

@Table({
  tableName: 'emails_enviados',
  timestamps: false,
})
export class EmailEnviado extends Model<
  EmailEnviadoAttributes,
  EmailEnviadoCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare nome_usuario: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email_usuario: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare texto_digitado: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare assunto: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare data_envio: Date;
}
