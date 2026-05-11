import { Module } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaController } from './busca.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { Servico } from 'src/models/servico.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Usuario } from 'src/models/usuario.model';
import { Empresa } from 'src/models/empresa.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Faq } from 'src/models/faq.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Blog,
      Banner,
      Publicidade,
      Servico,
      Usuario,
      Empresa,
      Faq,
      Solicitacao,
      DocumentoSolicitacao,
    ]),
  ],
  controllers: [BuscaController],
  providers: [BuscaService],
})
export class BuscaModule {}
