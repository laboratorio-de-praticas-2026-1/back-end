import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthService } from '../../commons/auth.service';
import { Logger } from '@nestjs/common';

@Module({
  providers: [ChatGateway, ChatService, AuthService, Logger],
})
export class ChatModule {}
