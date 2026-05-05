import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { Banner } from '../../models/banner.model';
import { UsuarioModule } from '../usuario/usuario.module';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Banner]),
    CloudinaryModule,
    UsuarioModule,
  ],
  controllers: [HeaderController],
  providers: [HeaderService],
})
export class HeaderModule {}
