import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async enviarEmailContato(dados: {
    nome: string;
    email: string;
    telefone?: string;
    mensagem: string;
    dataEnvio: Date;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: process.env.EMAIL_DESTINO || 'contato@bortone.com',
        subject: `Contato de ${dados.nome} - ${dados.email}`,
        html: `
          <h2>Novo contato via site</h2>
          <p><strong>Data/Hora:</strong> ${dados.dataEnvio.toLocaleString('pt-BR')}</p>
          <p><strong>Nome:</strong> ${dados.nome}</p>
          <p><strong>E-mail:</strong> ${dados.email}</p>
          <p><strong>Telefone:</strong> ${dados.telefone || 'Não informado'}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${dados.mensagem.replace(/\n/g, '<br>')}</p>
        `,
      });
      this.logger.log(`E-mail enviado com sucesso para ${process.env.EMAIL_DESTINO}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`);
      throw new Error('Erro ao enviar e-mail. Tente novamente mais tarde.');
    }
  }
}