import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SuperadminCreatePlanDto {
    @ApiProperty({ example: 'Pro' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Best for growing teams' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 79 })
    @IsInt()
    @Min(0)
    monthlyPrice: number;

    @ApiProperty({ example: 790 })
    @IsInt()
    @Min(0)
    yearlyPrice: number;

    @ApiProperty({ example: 25 })
    @IsInt()
    @Min(1)
    userLimit: number;

    @ApiProperty({ example: ['Priority support', 'API access'] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class SuperadminUpdatePlanDto {
    @ApiPropertyOptional({ example: 'Pro' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'Best for growing teams' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 79 })
    @IsOptional()
    @IsInt()
    @Min(0)
    monthlyPrice?: number;

    @ApiPropertyOptional({ example: 790 })
    @IsOptional()
    @IsInt()
    @Min(0)
    yearlyPrice?: number;

    @ApiPropertyOptional({ example: 25 })
    @IsOptional()
    @IsInt()
    @Min(1)
    userLimit?: number;

    @ApiPropertyOptional({ example: ['Priority support', 'API access'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    features?: string[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}