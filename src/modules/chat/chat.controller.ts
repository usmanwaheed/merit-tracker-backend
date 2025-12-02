
// src/modules/chat/chat.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateChatRoomDto, AddMemberDto, SendMessageDto } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('rooms')
    @ApiOperation({ summary: 'Create chat room' })
    async createRoom(@Body() createDto: CreateChatRoomDto, @CurrentUser() user: User) {
        return this.chatService.createRoom(createDto, user);
    }

    @Get('projects/:projectId/rooms')
    @ApiOperation({ summary: 'Get project chat rooms' })
    async getRooms(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.chatService.findAll(projectId, user.companyId);
    }

    @Get('rooms/:roomId')
    @ApiOperation({ summary: 'Get chat room details' })
    async getRoom(@Param('roomId') roomId: string, @CurrentUser() user: User) {
        return this.chatService.findOne(roomId, user.companyId);
    }

    @Post('rooms/:roomId/members')
    @ApiOperation({ summary: 'Add member to chat room' })
    async addMember(
        @Param('roomId') roomId: string,
        @Body() addDto: AddMemberDto,
        @CurrentUser() user: User,
    ) {
        return this.chatService.addMember(roomId, addDto, user);
    }

    @Post('rooms/:roomId/messages')
    @ApiOperation({ summary: 'Send message' })
    async sendMessage(
        @Param('roomId') roomId: string,
        @Body() messageDto: SendMessageDto,
        @CurrentUser() user: User,
    ) {
        return this.chatService.sendMessage(roomId, messageDto, user);
    }

    @Get('rooms/:roomId/messages')
    @ApiOperation({ summary: 'Get messages' })
    async getMessages(
        @Param('roomId') roomId: string,
        @Query('limit', ParseIntPipe) limit: number = 50,
        @CurrentUser() user: User,
    ) {
        return this.chatService.getMessages(roomId, user, limit);
    }
}