// src/modules/projects/project-members.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectMembersService } from './project-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/project-members.dto';

@ApiTags('project-members')
@Controller('projects/:projectId/members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectMembersController {
    constructor(private readonly projectMembersService: ProjectMembersService) { }

    @Post()
    @ApiOperation({ summary: 'Add member to project' })
    async addMember(
        @Param('projectId') projectId: string,
        @Body() addDto: AddMemberDto,
        @CurrentUser() user: User,
    ) {
        return this.projectMembersService.addMember(projectId, addDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all project members' })
    async getMembers(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.projectMembersService.getMembers(projectId, user.companyId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get project leaderboard' })
    async getLeaderboard(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.projectMembersService.getLeaderboard(projectId, user.companyId);
    }

    @Patch(':memberId/role')
    @ApiOperation({ summary: 'Update member role' })
    async updateRole(
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
        @Body() updateDto: UpdateMemberRoleDto,
        @CurrentUser() user: User,
    ) {
        return this.projectMembersService.updateMemberRole(projectId, memberId, updateDto, user);
    }

    @Delete(':memberId')
    @ApiOperation({ summary: 'Remove member from project' })
    async removeMember(
        @Param('projectId') projectId: string,
        @Param('memberId') memberId: string,
        @CurrentUser() user: User,
    ) {
        return this.projectMembersService.removeMember(projectId, memberId, user);
    }
}

