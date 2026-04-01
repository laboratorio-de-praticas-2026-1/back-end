import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'contato_mensagem' })
export class ContatoMensagem extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare telefone: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare mensagem: string;

  @Column({ 
    field: 'data_envio', 
    type: DataType.DATE, 
    defaultValue: DataType.NOW 
  })
  declare dataEnvio: Date;
}