import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailerModule } from '@nestjs-modules/mailer';
import { Empresa } from 'src/models/empresa.model';
import { ContatoMensagem } from 'src/models/contato-mensagem.model';
import { ContatoController } from './contato.controller';
import { ContatoService } from './contato.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Empresa, ContatoMensagem]),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Site Bortone" <${process.env.EMAIL_USER || 'contato@bortone.com'}>`,
      },
    }),
  ],
  controllers: [ContatoController],
  providers: [ContatoService, EmailService],
})
export class ContatoModule {}