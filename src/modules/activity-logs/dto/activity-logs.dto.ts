// src/modules/activity-logs/dto/activity-logs.dto.ts
import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class CreateActivityLogDto {
    @ApiProperty({ enum: ActivityType }) @IsEnum(ActivityType) activityType: ActivityType;
    @ApiProperty() @IsString() description: string;
    @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
    @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
    @ApiPropertyOptional() @IsOptional() @IsString() ipAddress?: string;
}

export class ActivityLogQueryDto {
    @ApiPropertyOptional({ enum: ActivityType }) @IsOptional() @IsEnum(ActivityType) activityType?: ActivityType;
    @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}