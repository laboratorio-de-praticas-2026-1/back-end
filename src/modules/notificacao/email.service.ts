// perguntar se pode criar o email service em outra pasta pois seria o ideal src/modules/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailPayload {
  destinatario: string;
  assunto: string;
  tipo: 'ALERTA_CNH' | 'ALERTA_LICENCIAMENTO' | 'ALERTA_DEBITO';
  dados: {
    nomeUsuario: string;
    placa?: string;
    diasRestantes?: number;
    dataVencimento?: string;
    valorDebito?: number;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  /**
   * Envia email de notificação
   */
  async enviarNotificacao(payload: EmailPayload): Promise<boolean> {
    try {
      const html = this.gerarTemplateHtml(payload);

      const info = await this.transporter.sendMail({
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
        to: payload.destinatario,
        subject: payload.assunto,
        html,
      });

      this.logger.log(`Email enviado com sucesso: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email: ${error.message}`);
      return false;
    }
  }

  /**
   * Gera HTML do email conforme o tipo de notificação
   */
  private gerarTemplateHtml(payload: EmailPayload): string {
    const { nomeUsuario, placa, diasRestantes, dataVencimento, valorDebito } = payload.dados;

    let conteudo = '';
    let titulo = '';
    let cor = '#ff6b6b';

    switch (payload.tipo) {
      case 'ALERTA_CNH':
        titulo = '⚠️ Atenção: Sua CNH vence em breve!';
        cor = '#ff6b6b';
        conteudo = `
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>Informamos que sua <strong>Carteira Nacional de Habilitação (CNH)</strong> vence em <strong>${diasRestantes} dias</strong>.</p>
          <p><strong>Data de vencimento:</strong> ${dataVencimento}</p>
          <p>Renove sua CNH antes da data limite para evitar multas e problemas legais.</p>
        `;
        break;

      case 'ALERTA_LICENCIAMENTO':
        titulo = '⚠️ Atenção: Licenciamento do veículo vence em breve!';
        cor = '#ffa500';
        conteudo = `
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>O <strong>licenciamento do veículo ${placa}</strong> vence em <strong>${diasRestantes} dias</strong>.</p>
          <p><strong>Data de vencimento:</strong> ${dataVencimento}</p>
          <p>Procure um órgão de trânsito para renovar o licenciamento no prazo.</p>
        `;
        break;

      case 'ALERTA_DEBITO':
        titulo = '💰 Novo débito registrado';
        cor = '#ff6b6b';
        conteudo = `
          <p>Olá <strong>${nomeUsuario}</strong>,</p>
          <p>Um novo débito foi registrado para o veículo <strong>${placa}</strong>.</p>
          <p><strong>Valor:</strong> R$ ${valorDebito?.toFixed(2)}</p>
          <p>Regularize o débito o quanto antes para evitar juros e multas adicionais.</p>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background-color: ${cor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: white; padding: 20px; border-radius: 0 0 8px 8px; }
          .content p { margin: 10px 0; }
          .cta-button { display: inline-block; background-color: ${cor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${titulo}</h2>
          </div>
          <div class="content">
            ${conteudo}
            <a href="${process.env.FRONTEND_URL}" class="cta-button">Acessar plataforma</a>
          </div>
          <div class="footer">
            <p>Este é um email automático. Não responda diretamente.</p>
            <p>&copy; 2025 Sistema de Notificações. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verifica se o serviço de email está funcionando
   */
  async testarConexao(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão com servidor de email verificada com sucesso');
      return true;
    } catch (error) {
      this.logger.error(`Erro ao verificar conexão com email: ${error.message}`);
      return false;
    }
  }
}
