import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SuperadminUpdateSettingsDto {
    @ApiPropertyOptional({ example: 'MeritTracker' })
    @IsOptional()
    @IsString()
    platformName?: string;

    @ApiPropertyOptional({ example: 'support@merittracker.com' })
    @IsOptional()
    @IsEmail()
    supportEmail?: string;

    @ApiPropertyOptional({ example: 'A comprehensive task management platform.' })
    @IsOptional()
    @IsString()
    platformDescription?: string;

    @ApiPropertyOptional({ example: 'utc' })
    @IsOptional()
    @IsString()
    defaultTimezone?: string;

    @ApiPropertyOptional({ example: 'usd' })
    @IsOptional()
    @IsString()
    defaultCurrency?: string;

    @ApiPropertyOptional({ example: 'pk_live_...' })
    @IsOptional()
    @IsString()
    stripePublicKey?: string;

    @ApiPropertyOptional({ example: 'sk_live_...' })
    @IsOptional()
    @IsString()
    stripeSecretKey?: string;

    @ApiPropertyOptional({ example: 14 })
    @IsOptional()
    @IsInt()
    @Min(1)
    trialDays?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    autoRetryFailedPayments?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    autoInvoiceGeneration?: boolean;

    @ApiPropertyOptional({ example: '#6366f1' })
    @IsOptional()
    @IsString()
    primaryColor?: string;

    @ApiPropertyOptional({ example: 'system' })
    @IsOptional()
    @IsString()
    theme?: string;

    @ApiPropertyOptional({ example: 'https://merittracker.com/logo.svg' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 'https://merittracker.com/favicon.ico' })
    @IsOptional()
    @IsString()
    faviconUrl?: string;
}