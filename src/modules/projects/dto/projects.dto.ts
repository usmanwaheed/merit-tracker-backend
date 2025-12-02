// src/modules/projects/dto/projects.dto.ts
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../../entities/project.entity';

export class CreateProjectDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    budget?: number;

    @ApiProperty({ enum: ProjectStatus, required: false })
    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    projectLeadId?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    screenMonitoringEnabled?: boolean;
}

export class UpdateProjectDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    budget?: number;

    @ApiProperty({ enum: ProjectStatus, required: false })
    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    projectLeadId?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    screenMonitoringEnabled?: boolean;
}