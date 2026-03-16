import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModule } from './modules/chat/chat.module';
import { ContatoModule } from './modules/contato/contato.module';
import { FaqModule } from './modules/faq/faq.module';
import { BlogModule } from './modules/blog/blog.module';
import { SimuladorModule } from './modules/simulador/simulador.module';
import { NotificacaoModule } from './modules/notificacao/notificacao.module';
import { MapaModule } from './modules/mapa/mapa.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RecomendacaoModule } from './modules/recomendacao/recomendacao.module';
import { AgendamentoModule } from './modules/agendamento/agendamento.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { HeaderModule } from './modules/header/header.module';
import { BuscaModule } from './modules/busca/busca.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { PublicidadeModule } from './modules/publicidade/publicidade.module';
import { SolicitacaoModule } from './modules/solicitacao/solicitacao.module';

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
    SolicitacaoModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
