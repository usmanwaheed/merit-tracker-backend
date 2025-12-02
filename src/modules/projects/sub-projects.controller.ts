// src/modules/projects/sub-projects.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubProjectsService } from './sub-projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateSubProjectDto, UpdateSubProjectDto } from './dto/sub-projects.dto';

@ApiTags('sub-projects')
@Controller('projects/:projectId/sub-projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubProjectsController {
    constructor(private readonly subProjectsService: SubProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create sub-project' })
    async create(
        @Param('projectId') projectId: string,
        @Body() createDto: CreateSubProjectDto,
        @CurrentUser() user: User,
    ) {
        return this.subProjectsService.create(projectId, createDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sub-projects' })
    async findAll(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.subProjectsService.findAll(projectId, user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get sub-project by ID' })
    async findOne(
        @Param('projectId') projectId: string,
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.subProjectsService.findOne(id, projectId, user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update sub-project' })
    async update(
        @Param('projectId') projectId: string,
        @Param('id') id: string,
        @Body() updateDto: UpdateSubProjectDto,
        @CurrentUser() user: User,
    ) {
        return this.subProjectsService.update(id, projectId, updateDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete sub-project' })
    async delete(
        @Param('projectId') projectId: string,
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.subProjectsService.delete(id, projectId, user);
    }
}
