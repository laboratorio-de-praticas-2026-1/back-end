import { Module } from '@nestjs/common';
import { BuscaService } from './busca.service';
import { BuscaController } from './busca.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Blog } from 'src/models/blog.model';
import { CarrosselModule } from '../carrossel/carrossel.module';

@Module({
  imports: [SequelizeModule.forFeature([Blog]), CarrosselModule],
  controllers: [BuscaController],
  providers: [BuscaService],
})
export class BuscaModule {}
