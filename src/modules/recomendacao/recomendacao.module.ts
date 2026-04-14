import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { InteracaoUsuario } from 'src/models/interacao-usuario.model';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoController } from './recomendacao.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { Debito } from 'src/models/debito.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Servico, Solicitacao, Usuario, Veiculo]),
    SequelizeModule.forFeature([   
      Servico,
      Solicitacao,
      Usuario,
      Veiculo,
      InteracaoUsuario,
      Debito,
      DebitoVeiculo,
    ]),
    CloudinaryModule,
  ],
  controllers: [RecomendacaoController],
  providers: [RecomendacaoService],
})
export class RecomendacaoModule {}
