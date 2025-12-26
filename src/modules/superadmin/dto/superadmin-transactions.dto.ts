import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SuperadminTransactionTypeFilter {
    PAYMENT = 'payment',
    REFUND = 'refund',
}

export enum SuperadminTransactionStatusFilter {
    COMPLETED = 'completed',
    PENDING = 'pending',
    FAILED = 'failed',
}

export enum SuperadminTransactionRangeFilter {
    DAYS_7 = '7d',
    DAYS_30 = '30d',
    DAYS_90 = '90d',
    ALL = 'all',
}

export class SuperadminTransactionsQueryDto {
    @ApiPropertyOptional({ example: 'TXN' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: SuperadminTransactionTypeFilter })
    @IsOptional()
    @IsEnum(SuperadminTransactionTypeFilter)
    type?: SuperadminTransactionTypeFilter;

    @ApiPropertyOptional({ enum: SuperadminTransactionStatusFilter })
    @IsOptional()
    @IsEnum(SuperadminTransactionStatusFilter)
    status?: SuperadminTransactionStatusFilter;

    @ApiPropertyOptional({ enum: SuperadminTransactionRangeFilter })
    @IsOptional()
    @IsEnum(SuperadminTransactionRangeFilter)
    range?: SuperadminTransactionRangeFilter;
}