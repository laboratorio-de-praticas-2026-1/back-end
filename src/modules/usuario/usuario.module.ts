import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from 'src/models/usuario.model';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([Usuario]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioOwnerGuard, AdminGuard, JwtAuthGuard],
  exports: [AdminGuard, JwtAuthGuard, JwtModule],
})
export class UsuarioModule {}
