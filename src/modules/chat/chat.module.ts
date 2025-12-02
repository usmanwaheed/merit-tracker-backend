// src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRoom } from '../../entities/chat-room.entity';
import { ChatRoomMember } from '../../entities/chat-room-member.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ChatRoom, ChatRoomMember, ChatMessage, Project, User])],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule { }