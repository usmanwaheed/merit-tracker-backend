// src/modules/sops/dto/sops.dto.ts
import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SopType, SopStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateSopDto {
    @ApiProperty() @IsString() @IsNotEmpty() title: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiProperty({ enum: SopType }) @IsEnum(SopType) type: SopType;
    @ApiProperty() @IsString() @IsNotEmpty() fileUrl: string;
    @ApiPropertyOptional() @IsOptional() @IsString() thumbnailUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) duration?: number;
    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateSopDto {
    @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional({ enum: SopType }) @IsOptional() @IsEnum(SopType) type?: SopType;
    @ApiPropertyOptional() @IsOptional() @IsString() fileUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() thumbnailUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) duration?: number;
    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class ApproveSopDto { @ApiPropertyOptional() @IsOptional() @IsString() notes?: string; }
export class RejectSopDto { @ApiProperty() @IsString() @IsNotEmpty() rejectionReason: string; }

export class SopQueryDto {
    @ApiPropertyOptional({ enum: SopType }) @IsOptional() @IsEnum(SopType) type?: SopType;
    @ApiPropertyOptional({ enum: SopStatus }) @IsOptional() @IsEnum(SopStatus) status?: SopStatus;
    @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}