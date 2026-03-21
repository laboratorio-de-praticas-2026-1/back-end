import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Banner } from 'src/models/banner.model';
import { CarrosselController } from './carrossel.controller';
import { CarrosselService } from './carrossel.service';

@Module({
  imports: [SequelizeModule.forFeature([Banner])],
  controllers: [CarrosselController],
  providers: [CarrosselService],
  exports: [CarrosselService],
})
export class CarrosselModule {}
