import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';
import { join } from 'path';

interface DebitoRow {
  email: string;
  nome: string;
  descricao: string;
  valor: number;
  placa: string;
  created_at: Date;
}

@Injectable()
export class NotificacaoService implements OnModuleInit {
  private readonly logger = new Logger(NotificacaoService.name);

  constructor(
    private readonly sequelize: Sequelize,
    private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('Serviço de Notificação Automática iniciado com sucesso.');
    this.iniciarCicloDeNotificacoes();
  }

  private iniciarCicloDeNotificacoes() {
    void this.processarEnvioDeDebitos();
    this.agendarProximaSegunda();
  }

  private agendarProximaSegunda() {
    const agora = new Date();
    const diasParaProximaSegunda = this.calcularDiasProximaSegunda(agora);
    const msAteProximaSegunda = diasParaProximaSegunda * 24 * 60 * 60 * 1000;

    this.logger.log(
      `Próxima execução agendada para segunda-feira, daqui a ${diasParaProximaSegunda} dia(s).`,
    );

    setTimeout(() => {
      void this.processarEnvioDeDebitos();
      this.agendarProximaSegunda();
    }, msAteProximaSegunda);
  }

  private calcularDiasProximaSegunda(data: Date): number {
    const diaAtual = data.getDay();
    let diasParaSegunda = 1 - diaAtual;
    if (diasParaSegunda <= 0) {
      diasParaSegunda += 7;
    }
    return diasParaSegunda;
  }

  async processarEnvioDeDebitos() {
    try {
      this.logger.log('Consultando registros de débitos pendentes no banco...');

      const resultados = await this.sequelize.query<DebitoRow>(
        `SELECT u.email, u.nome, d.descricao, d.valor, v.placa, d.created_at
         FROM usuario u
         JOIN veiculo v ON v.usuario_id = u.id
         JOIN debito_veiculo dv ON dv.id_veiculo = v.id
         JOIN debito d ON d.id = dv.id_debito
         WHERE d.status = 'pendente'`,
        { type: QueryTypes.SELECT },
      );

      if (resultados.length === 0) {
        this.logger.log('Nenhum débito pendente identificado nesta varredura.');
        return;
      }

      const listaDeEnvio = resultados.reduce(
        (acc, current) => {
          if (!acc[current.email]) {
            acc[current.email] = { nome: current.nome, debitos: [] };
          }
          acc[current.email].debitos.push(current);
          return acc;
        },
        {} as Record<string, { nome: string; debitos: DebitoRow[] }>,
      );

      for (const [email, info] of Object.entries(listaDeEnvio)) {
        try {
          const totalValor = info.debitos.reduce(
            (sum, d) => sum + Number(d.valor),
            0,
          );

          const params = new EmailParams(
            email,
            join(
              process.cwd(),
              'src',
              'infra',
              'email',
              'templates',
              'contato-duvida-cliente.ejs',
            ),
            '⚠️ Aviso: Você possui débitos pendentes',
            {
              nome: info.nome,
              email: email,
              telefone: 'Sistema de Notificação Automática',
              assunto: 'Notificação de Débito em Aberto',
              mensagem: `Detectamos ${info.debitos.length} débito(s) pendente(s) em seu CPF/CNPJ. Valor total: R$ ${totalValor.toFixed(2)}.`,
            },
            true,
          );

          await this.emailService.enviarEmail(params);
          this.logger.log(`[NOTIFICAÇÃO] Resumo enviado para: ${email}`);
        } catch (mailError: unknown) {
          const errorMessage =
            mailError instanceof Error ? mailError.message : 'Erro desconhecido';
          this.logger.error(
            `[ERRO ENVIO] Falha ao processar e-mail para ${email}: ${errorMessage}`,
          );
        }
      }
    } catch (dbError: unknown) {
      const errorMessage =
        dbError instanceof Error ? dbError.message : 'Erro desconhecido';
      this.logger.error(
        `[ERRO BANCO] Falha crítica na consulta SQL: ${errorMessage}`,
      );
    }
  }

  async getUserNotifications(_userId: number) {
    await Promise.resolve();
    return [];
  }

  async enviarConfirmacaoSolicitacao(_data: unknown): Promise<void> {
    await Promise.resolve();
    return;
  }
}