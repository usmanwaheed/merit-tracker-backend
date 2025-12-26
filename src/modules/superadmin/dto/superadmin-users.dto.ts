import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SuperadminUserStatusFilter {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
}

export enum SuperadminUserRoleFilter {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

export class SuperadminUsersQueryDto {
    @ApiPropertyOptional({ example: 'john' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: SuperadminUserRoleFilter, example: SuperadminUserRoleFilter.ADMIN })
    @IsOptional()
    @IsEnum(SuperadminUserRoleFilter)
    role?: SuperadminUserRoleFilter;

    @ApiPropertyOptional({ enum: SuperadminUserStatusFilter, example: SuperadminUserStatusFilter.ACTIVE })
    @IsOptional()
    @IsEnum(SuperadminUserStatusFilter)
    status?: SuperadminUserStatusFilter;
}