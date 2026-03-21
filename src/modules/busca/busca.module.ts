import { Module } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaController } from './busca.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { Banner } from 'src/models/banner.model';

@Module({
  imports: [SequelizeModule.forFeature([Blog, Banner])],
  controllers: [BuscaController],
  providers: [BuscaService],
})
export class BuscaModule {}
