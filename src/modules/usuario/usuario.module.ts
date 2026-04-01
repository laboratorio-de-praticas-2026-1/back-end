import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from 'src/models/usuario.model';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';

@Module({
  imports: [SequelizeModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioOwnerGuard],
})
export class UsuarioModule {}
