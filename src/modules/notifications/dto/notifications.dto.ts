// src/modules/notifications/dto/notifications.dto.ts
import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsNotEmpty, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateNotificationDto {
    @ApiProperty() @IsUUID() userId: string;
    @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
    @ApiProperty() @IsString() @IsNotEmpty() title: string;
    @ApiProperty() @IsString() @IsNotEmpty() message: string;
    @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class BulkNotificationDto {
    @ApiProperty({ type: [String] }) @IsArray() @IsUUID('4', { each: true }) userIds: string[];
    @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
    @ApiProperty() @IsString() @IsNotEmpty() title: string;
    @ApiProperty() @IsString() @IsNotEmpty() message: string;
    @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class NotificationQueryDto {
    @ApiPropertyOptional({ enum: NotificationType }) @IsOptional() @IsEnum(NotificationType) type?: NotificationType;
    @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() unreadOnly?: boolean;
}