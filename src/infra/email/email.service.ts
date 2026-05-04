import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { join } from 'path';
import { EmailParams } from './dto/email-params';
import { InjectModel } from '@nestjs/sequelize';
import { EmailEnviado } from 'src/models/email-enviado.model';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly ASSUNTO_FIXO = 'Contato Duvida Cliente';

  constructor(
    private readonly mailerService: MailerService,

    @InjectModel(EmailEnviado)
    private readonly emailModel: typeof EmailEnviado,
  ) {}

  private normalizeDados(dados: Record<string, any>): Record<string, object> {
    const result: Record<string, object> = {};

    for (const key in dados) {
      const value = dados[key];

      if (typeof value === 'object' && value !== null) {
        result[key] = value;
      } else {
        result[key] = Object(value);
      }
    }

    return result;
  }

  private toSafeString(value: any): string | null {
    if (value === null || value === undefined) return null;
    return value.toString();
  }

  async enviarEmail(params: EmailParams): Promise<void> {
    if (!params?.to || !params?.template) {
      this.logger.warn('Parâmetros de e-mail incompletos', params);
      throw new BadRequestException('Parâmetros de e-mail incompletos');
    }

    if (!params?.dados) {
      this.logger.warn('Dados não enviados no e-mail', params);
      throw new BadRequestException('Dados do e-mail não informados');
    }

    const assuntoFinal = this.ASSUNTO_FIXO;

    const nome = this.toSafeString(params.dados?.nome);
    const email = this.toSafeString(params.dados?.email);
    const telefone = this.toSafeString(params.dados?.telefone);
    const mensagem = this.toSafeString(params.dados?.mensagem);

    const dadosNormalizados = this.normalizeDados({
      nome,
      email,
      telefone,
      mensagem,
      assunto: assuntoFinal,
    });

    try {
      await this.mailerService.sendMail({
        to: params.to,
        subject: assuntoFinal,
        template: params.template,
        context: {
          dados: dadosNormalizados,
          assunto: assuntoFinal,
          withHeader: params.withHeader ?? true,
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

      this.logger.log(`E-mail enviado com sucesso para ${params.to}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail', error);
  
      throw new BadRequestException('Erro ao enviar e-mail');
    }

    try {
      if (!nome || !email || !mensagem) {
        this.logger.warn(
          'Dados inválidos para salvar no banco',
          params.dados,
        );
        return;
      }

      await this.emailModel.create({
        nomeUsuario: nome,
        emailUsuario: email,
        textoDigitado: mensagem,
        assunto: assuntoFinal,
        dataEnvio: new Date(),
      });
    } catch (dbError) {
      this.logger.error('Erro ao salvar e-mail no banco', dbError);
    }
  }
}