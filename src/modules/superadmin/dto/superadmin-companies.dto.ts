import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SuperadminCompanyPlan {
    STARTER = 'starter',
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export enum SuperadminCompanyStatus {
    ACTIVE = 'active',
    TRIAL = 'trial',
    SUSPENDED = 'suspended',
}

export class SuperadminCompaniesQueryDto {
    @ApiPropertyOptional({ example: 'Acme', description: 'Search by company name' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: SuperadminCompanyPlan, example: SuperadminCompanyPlan.PRO })
    @IsOptional()
    @IsEnum(SuperadminCompanyPlan)
    plan?: SuperadminCompanyPlan;

    @ApiPropertyOptional({ enum: SuperadminCompanyStatus, example: SuperadminCompanyStatus.ACTIVE })
    @IsOptional()
    @IsEnum(SuperadminCompanyStatus)
    status?: SuperadminCompanyStatus;
}

export class SuperadminCreateCompanyDto {
    @ApiProperty({ example: 'Acme Corporation' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'admin@acme.com' })
    @IsEmail()
    adminEmail: string;

    @ApiPropertyOptional({ example: 'Jane' })
    @IsOptional()
    @IsString()
    adminFirstName?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsOptional()
    @IsString()
    adminLastName?: string;

    @ApiProperty({ enum: SuperadminCompanyPlan, example: SuperadminCompanyPlan.ENTERPRISE })
    @IsEnum(SuperadminCompanyPlan)
    plan: SuperadminCompanyPlan;
}