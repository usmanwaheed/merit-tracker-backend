// src/modules/chat/chat.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
// import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateChatRoomDto, UpdateChatRoomDto, AddChatMembersDto, RemoveChatMembersDto, SendMessageDto, UpdateMessageDto, ChatQueryDto } from './dto/chat.dto';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/guards';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('rooms') @ApiOperation({ summary: 'Create a new chat room' })
    async createRoom(@Body() dto: CreateChatRoomDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.createRoom(dto, userId, role as any, companyId); }

    @Get('rooms') @ApiOperation({ summary: 'Get all chat rooms in company' })
    async findAllRooms(@CurrentUser('companyId') companyId: string, @Query() query: ChatQueryDto) { return this.chatService.findAllRooms(companyId, query); }

    @Get('rooms/my-rooms') @ApiOperation({ summary: 'Get chat rooms where current user is a member' })
    async findMyRooms(@CurrentUser('id') userId: string, @CurrentUser('companyId') companyId: string) { return this.chatService.findUserRooms(userId, companyId); }

    @Get('rooms/:id') @ApiOperation({ summary: 'Get chat room by ID' })
    async findRoom(@Param('id') id: string, @CurrentUser('companyId') companyId: string) { return this.chatService.findRoom(id, companyId); }

    @Put('rooms/:id') @ApiOperation({ summary: 'Update chat room' })
    async updateRoom(@Param('id') id: string, @Body() dto: UpdateChatRoomDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.updateRoom(id, dto, userId, role as any, companyId); }

    @Patch('rooms/:id/members/add') @ApiOperation({ summary: 'Add members to chat room' })
    async addMembers(@Param('id') id: string, @Body() dto: AddChatMembersDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.addMembers(id, dto, userId, role as any, companyId); }

    @Patch('rooms/:id/members/remove') @ApiOperation({ summary: 'Remove members from chat room' })
    async removeMembers(@Param('id') id: string, @Body() dto: RemoveChatMembersDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.removeMembers(id, dto, userId, role as any, companyId); }

    @Delete('rooms/:id') @ApiOperation({ summary: 'Delete chat room' })
    async deleteRoom(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.deleteRoom(id, userId, role as any, companyId); }

    @Post('rooms/:roomId/messages') @ApiOperation({ summary: 'Send a message to chat room' })
    async sendMessage(@Param('roomId') roomId: string, @Body() dto: SendMessageDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.sendMessage(roomId, dto, userId, role as any, companyId); }

    @Get('rooms/:roomId/messages') @ApiOperation({ summary: 'Get messages from chat room' }) @ApiQuery({ name: 'limit', required: false, type: Number }) @ApiQuery({ name: 'before', required: false, type: String })
    async getMessages(@Param('roomId') roomId: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string, @Query('limit') limit?: number, @Query('before') before?: string) { return this.chatService.getMessages(roomId, userId, role as any, companyId, limit || 50, before); }

    @Put('messages/:messageId') @ApiOperation({ summary: 'Edit a message' })
    async updateMessage(@Param('messageId') messageId: string, @Body() dto: UpdateMessageDto, @CurrentUser('id') userId: string, @CurrentUser('companyId') companyId: string) { return this.chatService.updateMessage(messageId, dto, userId, companyId); }

    @Delete('messages/:messageId') @ApiOperation({ summary: 'Delete a message' })
    async deleteMessage(@Param('messageId') messageId: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.chatService.deleteMessage(messageId, userId, role as any, companyId); }
}