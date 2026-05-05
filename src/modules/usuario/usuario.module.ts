import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsuarioOwnerGuard } from './guards/usuario-owner.guard';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

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
  providers: [UsuarioService, UsuarioOwnerGuard, JwtAuthGuard, RolesGuard],
  exports: [
    UsuarioService,
    UsuarioOwnerGuard,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class UsuarioModule {}
