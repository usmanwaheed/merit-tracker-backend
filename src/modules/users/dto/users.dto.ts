
// src/modules/users/dto/users.dto.ts
import { IsString, IsOptional, IsEmail, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../entities/user.entity';

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    departmentId?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: Date;
}

export class UpdateUserRoleDto {
    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;
}