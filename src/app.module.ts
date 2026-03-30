import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from './infra/cloudinary/cloudinary.module';
import { AgendamentoModule } from './modules/agendamento/agendamento.module';
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
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),

    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      autoLoadModels: true,
      define: {
        timestamps: false,
      },
      synchronize: false, // NÃO MODIFICAR PARA TRUE
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
    AgendamentoModule,
    UsuarioModule,
    HeaderModule,
    BuscaModule,
    ServicosModule,
    PublicidadeModule,
    CloudinaryModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
