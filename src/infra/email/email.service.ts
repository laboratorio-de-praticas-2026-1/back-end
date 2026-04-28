import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { join } from 'path';
import { EmailParams } from './dto/email-params';
import { InjectModel } from '@nestjs/sequelize';
import { EmailEnviado } from 'src/models/email-enviado.model';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,

    @InjectModel(EmailEnviado)
    private readonly emailModel: typeof EmailEnviado,
  ) {}

  async enviarEmail(params: EmailParams): Promise<void> {
    try {
      if (!params?.assunto || !params?.to || !params?.template) {
        this.logger.warn('Parâmetros de e-mail incompletos', params);
        throw new BadRequestException('Parâmetros de e-mail incompletos');
      }

      if (!params?.dados) {
        this.logger.warn('Dados não enviados no e-mail', params);
        throw new BadRequestException('Dados do e-mail não informados');
      }

      const { nome, email, mensagem } = params.dados;

      await this.mailerService.sendMail({
        to: params.to,
        subject: params.assunto,
        template: params.template,
        context: {
          dados: params.dados,
          assunto: params.assunto,
        },
        attachments: [
          {
            filename: 'logo.png',
            path: join(process.cwd(), 'src', 'static', 'images', 'logo.png'),
            cid: 'logo_img',
            contentDisposition: 'inline',
            contentType: 'image/png',
          },
        ],
      });

      await this.emailModel.create({
        nome_usuario: nome,
        email_usuario: email,
        texto_digitado: mensagem,
        assunto: params.assunto,
        data_envio: new Date(),
      });

      this.logger.log(`E-mail enviado com sucesso para ${params.to}`);
    } catch (error) {
      try {
        const { nome, email, mensagem } = params?.dados || {};

        await this.emailModel.create({
          nome_usuario: nome,
          email_usuario: email,
          texto_digitado: mensagem,
          assunto: params?.assunto,
          data_envio: new Date(),
        });
      } catch (dbError) {
        this.logger.error('Erro ao salvar no banco', dbError);
      }

      this.logger.error('Erro ao enviar e-mail', error);
      throw new InternalServerErrorException('Erro ao enviar e-mail');
    }
  }
}
