import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailService } from './email.service';
import { EmailEnviado } from 'src/models/email-enviado.model';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([EmailEnviado]),

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        },

        defaults: {
          from: `"Site Bortone" <${process.env.EMAIL_USER}>`,
        },

        template: {
          dir: join(process.cwd(), 'src', 'infra', 'email', 'templates'),

          adapter: new EjsAdapter(),

          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
