import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthService } from '../../commons/auth.service';

@Module({
  providers: [ChatGateway, ChatService, AuthService],
})
export class ChatModule {}
