// src/modules/chat/dto/chat.dto.ts
import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatRoomDto {
    @ApiProperty() @IsString() @IsNotEmpty() name: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiProperty() @IsUUID() projectId: string;
    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) memberIds?: string[];
}

export class UpdateChatRoomDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class AddChatMembersDto { @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) userIds: string[]; }
export class RemoveChatMembersDto { @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) userIds: string[]; }
export class SendMessageDto { @ApiProperty() @IsString() @IsNotEmpty() content: string; }
export class UpdateMessageDto { @ApiProperty() @IsString() @IsNotEmpty() content: string; }

export class ChatQueryDto {
    @ApiPropertyOptional() @IsOptional() @IsUUID() projectId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}