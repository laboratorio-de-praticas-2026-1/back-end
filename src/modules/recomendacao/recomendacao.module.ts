import { Module } from '@nestjs/common';
import { RecomendacaoService } from './recomendacao.service';
import { RecomendacaoController } from './recomendacao.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Servico, Solicitacao, Usuario, Veiculo]), 
  ],
  controllers: [RecomendacaoController],
  providers: [RecomendacaoService],
})
export class RecomendacaoModule {}
