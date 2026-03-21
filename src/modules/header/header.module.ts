import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HeaderService } from './header.service';
import { HeaderController } from './header.controller';
import { Banner } from '../../models/banner.model';

@Module({
  imports: [SequelizeModule.forFeature([Banner])],
  controllers: [HeaderController],
  providers: [HeaderService],
})
export class HeaderModule {}
