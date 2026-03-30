import { Logger, Module } from '@nestjs/common';
import { Usuario } from 'src/models/usuario.model';
import { AuthService } from '../../commons/auth.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  providers: [ChatGateway, ChatService, AuthService, Logger],
  imports: [SequelizeModule.forFeature([Usuario])],
})
export class ChatModule {}
