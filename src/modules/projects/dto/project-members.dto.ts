// src/modules/projects/dto/project-members.dto.ts
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberRole } from '../../../entities/project-member.entity';

export class AddMemberDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: ProjectMemberRole, required: false })
    @IsEnum(ProjectMemberRole)
    @IsOptional()
    role?: ProjectMemberRole;
}

export class UpdateMemberRoleDto {
    @ApiProperty({ enum: ProjectMemberRole })
    @IsEnum(ProjectMemberRole)
    role: ProjectMemberRole;
}