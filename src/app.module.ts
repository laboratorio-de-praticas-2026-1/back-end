import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { UtilsModule } from './commons/utils/utils.module';
import { CloudinaryModule } from './infra/cloudinary/cloudinary.module';
import { FileConversorModule } from './infra/conversor/file-conversor/file-conversor.module';
import { EmailModule } from './infra/email/email.module';
import { BlogModule } from './modules/blog/blog.module';
import { BuscaModule } from './modules/busca/busca.module';
import { ChatModule } from './modules/chat/chat.module';
import { ContatoModule } from './modules/contato/contato.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FaqModule } from './modules/faq/faq.module';
import { HeaderModule } from './modules/header/header.module';
import { MapaModule } from './modules/mapa/mapa.module';
import { NotificacaoModule } from './modules/notificacao/notificacao.module';
import { PublicidadeModule } from './modules/publicidade/publicidade.module';
import { ReciboModule } from './modules/recibo/recibo.module';
import { RecomendacaoModule } from './modules/recomendacao/recomendacao.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { SimuladorModule } from './modules/simulador/simulador.module';
import { SolicitacaoModule } from './modules/solicitacao/solicitacao.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { VeiculoModule } from './modules/veiculo/veiculo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DATABASE_HOST');
        const port = Number(configService.get<string>('DATABASE_PORT') ?? 3306);
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const database = configService.get<string>('DATABASE_DB');

        return {
          dialect: 'mysql',
          host,
          port,
          username,
          password,
          database,
          autoLoadModels: true,
          define: {
            timestamps: false,
          },
          synchronize: false,
          logging: false,
        };
      },
    }),
    ScheduleModule.forRoot(),
    ContatoModule,
    FaqModule,
    ChatModule,
    BlogModule,
    SimuladorModule,
    NotificacaoModule,
    MapaModule,
    ReportsModule,
    DashboardModule,
    RecomendacaoModule,
    UsuarioModule,
    HeaderModule,
    BuscaModule,
    ServicosModule,
    PublicidadeModule,
    EmailModule,
    CloudinaryModule,
    SolicitacaoModule,
    UtilsModule,
    FileConversorModule,
    ReciboModule,
    VeiculoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
