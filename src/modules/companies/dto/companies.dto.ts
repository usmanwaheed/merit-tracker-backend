// src/modules/companies/dto/companies.dto.ts
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';

export class UpdateCompanyDto {
    @ApiPropertyOptional({ example: 'Acme Corporation' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional({ example: '123 Main Street' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://www.acme.com' })
    @IsOptional()
    @IsString()
    website?: string;
}