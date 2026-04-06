import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EnviarEmailDto } from './dto/enviar-email.dto';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async enviarEmail(dto: EnviarEmailDto): Promise<void> {
    try {
      const to = process.env.CONTACT_EMAIL || 'contato@empresa.com';

      const templatePath = path.resolve(
        process.cwd(),
        'templates',
        'contato.ejs',
      );

      const html = await ejs.renderFile(templatePath, {
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        assunto: dto.assunto,
        mensagem: dto.mensagem,
      });

      const logoPath = path.resolve(process.cwd(), 'images', 'logo.png');
      const logoExiste = fs.existsSync(logoPath);

      await this.mailerService.sendMail({
        to,
        subject: `Novo contato: ${dto.assunto}`,

        html,

        attachments: logoExiste
          ? [
              {
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo_img',
              },
            ]
          : [],
      });

      if (!logoExiste) {
        this.logger.warn(`Logo não encontrada em: ${logoPath}`);
      }

      this.logger.log(`E-mail enviado com sucesso para ${to}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail', error);
      throw new Error('Erro ao enviar e-mail');
    }
  }
}