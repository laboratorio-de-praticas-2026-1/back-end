import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'usuario' })
export class Usuario extends Model {
  @Column({ primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nome: string;

  @Column({ unique: true, type: DataType.STRING(100), allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare senha: string;

  @Column({
    type: DataType.ENUM('cliente', 'administrador'),
    defaultValue: 'cliente',
  })
  declare nivel: 'cliente' | 'administrador';

  @Column({ field: 'cpf_cnpj', type: DataType.STRING(20), allowNull: true })
  declare cpfCnpj: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare celular: string | null;

  @Column({
    field: 'data_cadastro',
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare dataCadastro: Date;

  // ==================== NOVOS ATRIBUTOS PARA NOTIFICAÇÃO ====================

  @Column({
    field: 'data_vencimento_cnh',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataVencimentoCnh: Date | null;

  @Column({
    field: 'data_renovacao_cnh_proxima',
    type: DataType.DATE,
    allowNull: true,
  })
  declare dataRenovacaoCnhProxima: Date | null;

  @Column({
    field: 'notificacoes_ativas',
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare notificacoesAtivas: boolean;

  @Column({
    field: 'dias_aviso_cnh',
    type: DataType.INTEGER,
    defaultValue: 30,
  })
  declare diasAvisoCnh: number;

  @Column({
    field: 'dias_aviso_licenciamento',
    type: DataType.INTEGER,
    defaultValue: 30,
  })
  declare diasAvisoLicenciamento: number;

  @Column({
    field: 'notificar_debitos',
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare notificarDebitos: boolean;

  @Column({
    field: 'enviar_email',
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare enviarEmail: boolean;

  @Column({
    field: 'ultima_notificacao_enviada',
    type: DataType.DATE,
    allowNull: true,
  })
  declare ultimaNotificacaoEnviada: Date | null;
}
