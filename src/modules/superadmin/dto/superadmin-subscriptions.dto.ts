import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SuperadminSubscriptionPlanFilter {
    STARTER = 'starter',
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export enum SuperadminSubscriptionStatusFilter {
    ACTIVE = 'active',
    TRIALING = 'trialing',
    PAST_DUE = 'past_due',
    CANCELLED = 'cancelled',
}

export enum SuperadminBillingCycleFilter {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
}

export class SuperadminSubscriptionsQueryDto {
    @ApiPropertyOptional({ example: 'Acme' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: SuperadminSubscriptionPlanFilter })
    @IsOptional()
    @IsEnum(SuperadminSubscriptionPlanFilter)
    plan?: SuperadminSubscriptionPlanFilter;

    @ApiPropertyOptional({ enum: SuperadminSubscriptionStatusFilter })
    @IsOptional()
    @IsEnum(SuperadminSubscriptionStatusFilter)
    status?: SuperadminSubscriptionStatusFilter;

    @ApiPropertyOptional({ enum: SuperadminBillingCycleFilter })
    @IsOptional()
    @IsEnum(SuperadminBillingCycleFilter)
    billingCycle?: SuperadminBillingCycleFilter;
}