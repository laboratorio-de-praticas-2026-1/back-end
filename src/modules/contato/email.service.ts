import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async enviarEmail({
    to,
    corpo,
    cabecalho,
  }: {
    to: string;
    corpo: string;
    cabecalho: boolean;
  }): Promise<void> {
    try {
      let conteudoFinal = corpo;

      const logoPath = path.resolve(process.cwd(), 'images', 'logo.png');

      const logoExiste = fs.existsSync(logoPath);

      if (cabecalho && logoExiste) {
        conteudoFinal = `
          <div style="text-align:center; background:#000;">
            <img 
              src="cid:logo_img"
              style="width:100%; max-width:600px;"
            />
          </div>
          <div style="padding:20px; font-family: Arial;">
            ${corpo}
          </div>
        `;
      }

      await this.mailerService.sendMail({
        to,
        subject: 'Nova mensagem de contato',
        html: conteudoFinal,

        attachments: cabecalho && logoExiste
          ? [
              {
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo_img',
              },
            ]
          : [],
      });

      if (cabecalho && !logoExiste) {
        this.logger.warn('Imagem do cabeçalho NÃO encontrada em: ' + logoPath);
      }

      this.logger.log(`E-mail enviado com sucesso para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`);
      throw new Error('Erro ao enviar e-mail.');
    }
  }
}
