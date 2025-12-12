// src/modules/sub-projects/sub-projects.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// import { SubProjectsService } from './sub-projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubProjectsService } from './sub-projects.service';
import { AssignSubProjectDto, CreateSubProjectDto, SubProjectQueryDto, UpdateSubProjectDto } from './dto/sub-projects.dto';
import { CurrentUser } from '../auth/guards';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
// import { CreateSubProjectDto, UpdateSubProjectDto, AssignSubProjectDto, SubProjectQueryDto } from './dto/sub-projects.dto';

@ApiTags('sub-projects')
@Controller('sub-projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubProjectsController {
    constructor(private readonly subProjectsService: SubProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task/sub-project' })
    async create(@Body() createDto: CreateSubProjectDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.create(createDto, userId, role as any, companyId);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get all tasks in a project' })
    async findAll(@Param('projectId') projectId: string, @CurrentUser('companyId') companyId: string, @Query() query: SubProjectQueryDto) {
        return this.subProjectsService.findAll(projectId, companyId, query);
    }

    @Get('my-tasks')
    @ApiOperation({ summary: 'Get all tasks assigned to current user' })
    async findMyTasks(@CurrentUser('id') userId: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.findUserSubProjects(userId, companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task by ID' })
    async findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.findOne(id, companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update task' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateSubProjectDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.update(id, updateDto, userId, role as any, companyId);
    }

    @Patch(':id/assign')
    @ApiOperation({ summary: 'Assign task to user' })
    async assign(@Param('id') id: string, @Body() dto: AssignSubProjectDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.assign(id, dto, userId, role as any, companyId);
    }

    @Patch(':id/unassign')
    @ApiOperation({ summary: 'Unassign task' })
    async unassign(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.unassign(id, userId, role as any, companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete task' })
    async delete(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.subProjectsService.delete(id, userId, role as any, companyId);
    }
}