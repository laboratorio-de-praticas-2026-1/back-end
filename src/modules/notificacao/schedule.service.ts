

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '../../models/usuario.model';
import { Veiculo } from '../../models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectModel(Usuario)
    private usuarioModel: typeof Usuario,
    @InjectModel(Veiculo)
    private veiculoModel: typeof Veiculo,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  /**
   * Job agendado: Executa toda segunda-feira às 9h
   * Verifica CNH vencendo e envia emails
   */
  @Cron(process.env.CRON_VERIFICAR_NOTIFICACOES || '0 9 * * 1')
  async verificarVencimentosCNH(): Promise<void> {
    this.logger.log('🔍 [CRON] Iniciando verificação de vencimentos de CNH...');

    const inicioJob = new Date();
    let notificacoesCriadas = 0;
    let emailsEnviados = 0;

    try {
      // Busca todos os usuários com notificações ativas
      const usuarios = await this.usuarioModel.findAll({
        where: { notificacoesAtivas: true },
      });

      for (const usuario of usuarios) {
        try {
          // Verifica se CNH está vencendo
          const notificacao = await this.notificacaoService.verificarVencimentoCNH(usuario.id);

          if (notificacao) {
            // Envia email
            const enviado = await this.notificacaoService.enviarNotificacao(notificacao);
            if (enviado) {
              emailsEnviados++;
              // Atualiza data do último email enviado
              await usuario.update({
                ultimaNotificacaoEnviada: new Date(),
              });
            }
            notificacoesCriadas++;
          }
        } catch (error) {
          this.logger.error(
            `Erro ao verificar CNH do usuário ${usuario.id}: ${error.message}`,
          );
        }
      }

      const tempoExecucao = new Date().getTime() - inicioJob.getTime();
      this.logger.log(
        `✅ [CRON] Verificação de CNH concluída: ${notificacoesCriadas} notificações, ${emailsEnviados} emails em ${tempoExecucao}ms`,
      );
    } catch (error) {
      this.logger.error(`❌ Erro no job de verificação de CNH: ${error.message}`);
    }
  }

  /**
   * Job agendado: Executa toda segunda-feira às 9h
   * Verifica licenciamento vencendo e envia emails
   */
  @Cron(process.env.CRON_VERIFICAR_NOTIFICACOES || '0 9 * * 1')
  async verificarVencimentosLicenciamento(): Promise<void> {
    this.logger.log('🔍 [CRON] Iniciando verificação de licenciamentos vencidos...');

    const inicioJob = new Date();
    let notificacoesCriadas = 0;
    let emailsEnviados = 0;

    try {
      const usuarios = await this.usuarioModel.findAll({
        where: { notificacoesAtivas: true },
      });

      for (const usuario of usuarios) {
        try {
          // Verifica licenciamentos vencendo
          const notificacoes =
            await this.notificacaoService.verificarVencimentoLicenciamento(usuario.id);

          for (const notificacao of notificacoes) {
            const enviado = await this.notificacaoService.enviarNotificacao(notificacao);
            if (enviado) {
              emailsEnviados++;
            }
            notificacoesCriadas++;
          }
        } catch (error) {
          this.logger.error(
            `Erro ao verificar licenciamento do usuário ${usuario.id}: ${error.message}`,
          );
        }
      }

      const tempoExecucao = new Date().getTime() - inicioJob.getTime();
      this.logger.log(
        `✅ [CRON] Verificação de licenciamento concluída: ${notificacoesCriadas} notificações, ${emailsEnviados} emails em ${tempoExecucao}ms`,
      );
    } catch (error) {
      this.logger.error(`❌ Erro no job de licenciamento: ${error.message}`);
    }
  }

  /**
   * Job agendado: Executa toda segunda-feira às 9h
   * Verifica débitos pendentes e envia emails
   */
  @Cron(process.env.CRON_VERIFICAR_NOTIFICACOES || '0 9 * * 1')
  async verificarDebitos(): Promise<void> {
    this.logger.log('🔍 [CRON] Iniciando verificação de débitos pendentes...');

    const inicioJob = new Date();
    let notificacoesCriadas = 0;
    let emailsEnviados = 0;

    try {
      const usuarios = await this.usuarioModel.findAll({
        where: { notificacoesAtivas: true, notificarDebitos: true },
      });

      for (const usuario of usuarios) {
        try {
          // Verifica débitos
          const notificacoes = await this.notificacaoService.verificarDebitos(usuario.id);

          for (const notificacao of notificacoes) {
            const enviado = await this.notificacaoService.enviarNotificacao(notificacao);
            if (enviado) {
              emailsEnviados++;
            }
            notificacoesCriadas++;
          }
        } catch (error) {
          this.logger.error(`Erro ao verificar débitos do usuário ${usuario.id}: ${error.message}`);
        }
      }

      const tempoExecucao = new Date().getTime() - inicioJob.getTime();
      this.logger.log(
        `✅ [CRON] Verificação de débitos concluída: ${notificacoesCriadas} notificações, ${emailsEnviados} emails em ${tempoExecucao}ms`,
      );
    } catch (error) {
      this.logger.error(`❌ Erro no job de débitos: ${error.message}`);
    }
  }

  /**
   * Executa todos os jobs manualmente (para testes)
   */
  async executarTodosOsJobs(): Promise<any> {
    this.logger.log('🔄 Executando todos os jobs manualmente...');

    await this.verificarVencimentosCNH();
    await this.verificarVencimentosLicenciamento();
    await this.verificarDebitos();

    return { sucesso: true, mensagem: 'Todos os jobs foram executados' };
  }
}
