import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { Publicidade } from 'src/models/publicidade.model';
import { PublicidadeController } from './publicidade.controller';
import { PublicidadeService } from './publicidade.service';

@Module({
  imports: [SequelizeModule.forFeature([Publicidade]), CloudinaryModule],
  controllers: [PublicidadeController],
  providers: [PublicidadeService],
})
export class PublicidadeModule {}
