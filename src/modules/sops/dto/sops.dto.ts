// src/modules/sops/dto/sops.dto.ts
import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SopType } from '../../../entities/sop.entity';

export class CreateSopDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: SopType })
    @IsEnum(SopType)
    type: SopType;

    @ApiProperty()
    @IsString()
    fileUrl: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class UpdateSopDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty({ type: [String], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class ApproveSopDto {
    // Can add optional fields like approval notes if needed
}

export class RejectSopDto {
    @ApiProperty()
    @IsString()
    reason: string;
}
