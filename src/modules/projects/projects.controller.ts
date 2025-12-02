// src/modules/projects/projects.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new project' })
    async create(@Body() createDto: CreateProjectDto, @CurrentUser() user: User) {
        return this.projectsService.create(createDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects in company' })
    async findAll(@CurrentUser() user: User) {
        return this.projectsService.findAll(user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.projectsService.findOne(id, user.companyId);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Get project statistics' })
    async getStats(@Param('id') id: string, @CurrentUser() user: User) {
        return this.projectsService.getProjectStats(id, user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update project' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateProjectDto,
        @CurrentUser() user: User,
    ) {
        return this.projectsService.update(id, updateDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete project' })
    async delete(@Param('id') id: string, @CurrentUser() user: User) {
        return this.projectsService.delete(id, user);
    }
}
