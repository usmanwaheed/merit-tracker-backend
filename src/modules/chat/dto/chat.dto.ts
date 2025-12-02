
// src/modules/chat/dto/chat.dto.ts
import { IsString, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsUUID()
    projectId: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    memberIds: string[];
}

export class AddMemberDto {
    @ApiProperty()
    @IsUUID()
    userId: string;
}

export class SendMessageDto {
    @ApiProperty()
    @IsString()
    content: string;
}