import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CloudinaryModule } from 'src/infra/cloudinary/cloudinary.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { Banner } from '../../models/banner.model';
import { HeaderController } from './header.controller';
import { HeaderService } from './header.service';
import { JwtAuthGuard } from '../usuario/guards/jwt-auth.guard';
import { RolesGuard } from '../usuario/guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([Banner]),
    CloudinaryModule,
    UsuarioModule,
  ],
  controllers: [HeaderController],
  providers: [HeaderService, JwtAuthGuard, RolesGuard],
})
export class HeaderModule {}
