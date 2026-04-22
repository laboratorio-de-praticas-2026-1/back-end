import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { join } from 'path';
import { EmailParams } from './dto/email-params';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async enviarEmail(params: EmailParams): Promise<void> {
    try {
      if (!params.assunto || !params.to || !params.template) {
        this.logger.warn('Parâmetros de e-mail incompletos', params);
        throw new BadRequestException('Parâmetros de e-mail incompletos');
      }

      await this.mailerService.sendMail({
        to: params.to,
        subject: params.assunto,
        template: params.template,
        context: {
          ...params.dados,
        },
        attachments: [
          {
            filename: 'logo.png',
            path: join(__dirname, '../', '../', 'static', 'images', 'logo.png'),
            cid: 'logo_img',
          },
        ],
      });

      this.logger.log(`E-mail enviado com sucesso para ${params.to}.`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail', error);
      throw new InternalServerErrorException('Erro ao enviar e-mail');
    }
  }
}
