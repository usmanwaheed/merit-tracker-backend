// src/modules/projects/dto/projects.dto.ts
import { IsString, IsOptional, IsUUID, IsArray, IsDateString, IsNotEmpty, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ProjectMemberRole } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
    @ApiProperty({ example: 'Website Redesign' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 50000 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    budget?: number;

    @ApiPropertyOptional({ enum: ProjectStatus })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    projectLeadId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    screenMonitoringEnabled?: boolean;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    memberIds?: string[];
}

export class UpdateProjectDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    budget?: number;

    @ApiPropertyOptional({ enum: ProjectStatus })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    projectLeadId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    screenMonitoringEnabled?: boolean;
}

export class AddProjectMembersDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    userIds: string[];
}

export class RemoveProjectMembersDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    userIds: string[];
}

export class UpdateMemberRoleDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: ProjectMemberRole })
    @IsEnum(ProjectMemberRole)
    role: ProjectMemberRole;
}

export class ProjectQueryDto {
    @ApiPropertyOptional({ enum: ProjectStatus })
    @IsOptional()
    @IsEnum(ProjectStatus)
    status?: ProjectStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}