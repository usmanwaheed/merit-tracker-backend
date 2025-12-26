import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum SuperadminAnalyticsRange {
    DAYS_7 = '7d',
    DAYS_30 = '30d',
    DAYS_90 = '90d',
    MONTHS_12 = '12m',
}

export class SuperadminAnalyticsQueryDto {
    @ApiPropertyOptional({ enum: SuperadminAnalyticsRange })
    @IsOptional()
    @IsEnum(SuperadminAnalyticsRange)
    range?: SuperadminAnalyticsRange;
}