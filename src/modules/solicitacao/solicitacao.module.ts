import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UtilsModule } from 'src/commons/utils/utils.module';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Solicitacao,
      DocumentoSolicitacao,
      Usuario,
      Veiculo,
      Servico,
    ]),
    NotificacaoModule,
    CloudinaryModule,
    UtilsModule,
    UsuarioModule,
  ],
  controllers: [SolicitacaoController],
  providers: [SolicitacaoService, JwtAuthGuard, RolesGuard],
})
export class SolicitacaoModule {}
