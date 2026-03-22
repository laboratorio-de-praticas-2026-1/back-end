import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { Banner } from '../../models/banner.model';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';

@Module({
  imports: [SequelizeModule.forFeature([Banner]), CloudinaryModule],
  controllers: [HeaderController],
  providers: [HeaderService],
})
export class HeaderModule {}
