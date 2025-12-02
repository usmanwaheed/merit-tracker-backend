
// src/modules/time-tracking/dto/time-tracking.dto.ts
import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartTrackingDto {
    @ApiProperty()
    @IsUUID()
    subProjectId: string;
}

export class StopTrackingDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class AddScreenshotDto {
    @ApiProperty()
    @IsString()
    screenshotUrl: string;
}