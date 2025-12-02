
// src/modules/departments/dto/departments.dto.ts
import { IsString, IsOptional, IsArray, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    tag?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    leadId?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: Date;
}

export class UpdateDepartmentDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    tag?: string;

    @ApiProperty({ required: false })
    @IsUUID()
    @IsOptional()
    leadId?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: Date;
}

export class AssignUsersDto {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsUUID('4', { each: true })
    userIds: string[];
}