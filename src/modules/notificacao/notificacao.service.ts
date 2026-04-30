import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';
import { join } from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NOTIFICACAO_DEBITOS_PRAZOS } from 'src/infra/email/templates/templates-names';

interface DebitoRow {
  email: string;
  nome: string;
  descricao: string;
  valor: number;
  placa: string;
  created_at: Date;
}

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);
  constructor(
    private readonly sequelize: Sequelize,
    private readonly emailService: EmailService,
  ) {}

  @Cron('*/2 * * * *') //Rodar a cada 2 minutos para testes
  //@Cron('0 9 * * 1') //Rodar toda segunda às 09:00
  async handleCron() {
    this.logger.log('Executando envio semanal de débitos...');
    await this.processarEnvioDeDebitos();
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
            NOTIFICACAO_DEBITOS_PRAZOS,
            '⚠️ Aviso: Você possui débitos pendentes',
            {
              nome: info.nome,
              email: email,
              debitos: info.debitos,
              totalValor: totalValor.toFixed(2),
              quantidade: info.debitos.length,
            },
            true,
          );

          await this.emailService.enviarEmail(params);
          this.logger.log(`[NOTIFICAÇÃO] Resumo enviado para: ${email}`);
        } catch (mailError: unknown) {
          const errorMessage =
            mailError instanceof Error
              ? mailError.message
              : 'Erro desconhecido';
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

 async getUserNotifications(userId: number) {
  const resultados = await this.sequelize.query<DebitoRow>(
    `SELECT u.email, u.nome, d.descricao, d.valor, v.placa, d.created_at
     FROM usuario u
     JOIN veiculo v ON v.usuario_id = u.id
     JOIN debito_veiculo dv ON dv.id_veiculo = v.id
     JOIN debito d ON d.id = dv.id_debito
     WHERE d.status = 'pendente'
     AND u.id = :userId`,
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
    },
  );

  //Parte em retornar json

  return resultados.map((debito) => ({
    titulo: 'Débito pendente',
    mensagem: `Você possui um débito pendente para o veículo ${debito.placa}. ${debito.descricao}`,
    valor: Number(debito.valor),
    data: debito.created_at,
  }));
}

  async enviarConfirmacaoSolicitacao(_data: unknown): Promise<void> {
    await Promise.resolve();
    return;
  }
}
