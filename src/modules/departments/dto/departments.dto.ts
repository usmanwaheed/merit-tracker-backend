// src/modules/departments/dto/departments.dto.ts
import { IsString, IsOptional, IsUUID, IsArray, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty({ example: 'Engineering' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Software development team' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'engineering' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ description: 'UUID of the department lead' })
    @IsOptional()
    @IsUUID()
    leadId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class UpdateDepartmentDto {
    @ApiPropertyOptional({ example: 'Engineering' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'Software development team' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'engineering' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ description: 'UUID of the department lead' })
    @IsOptional()
    @IsUUID()
    leadId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class AssignUsersDto {
    @ApiProperty({ type: [String], description: 'Array of user UUIDs to assign' })
    @IsArray()
    @IsUUID('4', { each: true })
    userIds: string[];
}