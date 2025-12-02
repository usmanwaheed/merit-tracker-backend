// src/modules/projects/dto/sub-projects.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubProjectStatus } from '../../../entities/sub-project.entity';

export class CreateSubProjectDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    assignedToId?: string;

    @ApiProperty({ enum: SubProjectStatus, required: false })
    @IsEnum(SubProjectStatus)
    @IsOptional()
    status?: SubProjectStatus;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    pointsValue?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    estimatedHours?: number;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;
}

export class UpdateSubProjectDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    assignedToId?: string;

    @ApiProperty({ enum: SubProjectStatus, required: false })
    @IsEnum(SubProjectStatus)
    @IsOptional()
    status?: SubProjectStatus;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    pointsValue?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    estimatedHours?: number;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dueDate?: Date;
}