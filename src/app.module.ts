import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UtilsModule } from './commons/utils/utils.module';
import { CloudinaryModule } from './infra/cloudinary/cloudinary.module';
import { FileConversorModule } from './infra/conversor/file-conversor/file-conversor.module';
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
import { RecomendacaoModule } from './modules/recomendacao/recomendacao.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { SimuladorModule } from './modules/simulador/simulador.module';
import { SolicitacaoModule } from './modules/solicitacao/solicitacao.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

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

        /*         console.log('===== CONFIG DO BANCO =====');
        console.log('DATABASE_HOST:', host);
        console.log('DATABASE_PORT:', port);
        console.log('DATABASE_USERNAME:', username);
        console.log('DATABASE_DB:', database);
        console.log('==========================='); */

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
    CloudinaryModule,
    SolicitacaoModule,
    UtilsModule,
    FileConversorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
