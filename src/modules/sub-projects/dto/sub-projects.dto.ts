// src/modules/sub-projects/dto/sub-projects.dto.ts
import { IsString, IsOptional, IsUUID, IsNotEmpty, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSubProjectDto {
    @ApiProperty({ example: 'Design Homepage' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsUUID()
    projectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    assignedToId?: string;

    @ApiPropertyOptional({ enum: SubProjectStatus, default: 'TODO' })
    @IsOptional()
    @IsEnum(SubProjectStatus)
    status?: SubProjectStatus;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pointsValue?: number;

    @ApiPropertyOptional({ example: 8 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    estimatedHours?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dueDate?: string;
}

export class UpdateSubProjectDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    assignedToId?: string;

    @ApiPropertyOptional({ enum: SubProjectStatus })
    @IsOptional()
    @IsEnum(SubProjectStatus)
    status?: SubProjectStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    pointsValue?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    estimatedHours?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dueDate?: string;
}

export class AssignSubProjectDto {
    @ApiProperty()
    @IsUUID()
    userId: string;
}

export class SubProjectQueryDto {
    @ApiPropertyOptional({ enum: SubProjectStatus })
    @IsOptional()
    @IsEnum(SubProjectStatus)
    status?: SubProjectStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    assignedToId?: string;
}