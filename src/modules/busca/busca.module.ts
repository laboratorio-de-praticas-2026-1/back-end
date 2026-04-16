import { Module } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaController } from './busca.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';
import { Publicidade } from 'src/models/publicidade.model';
import { Usuario } from 'src/models/usuario.model';

@Module({
  imports: [SequelizeModule.forFeature([Blog, Banner, Publicidade, Usuario])],
  controllers: [BuscaController],
  providers: [BuscaService],
})
export class BuscaModule {}
