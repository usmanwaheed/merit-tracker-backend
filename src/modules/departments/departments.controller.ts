// src/modules/departments/departments.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, AssignUsersDto } from './dto/departments.dto';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new department' })
    async create(@Body() createDto: CreateDepartmentDto, @CurrentUser() user: User) {
        return this.departmentsService.create(createDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all departments in company' })
    async findAll(@CurrentUser() user: User) {
        return this.departmentsService.findAll(user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department by ID' })
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.departmentsService.findOne(id, user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update department' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDepartmentDto,
        @CurrentUser() user: User,
    ) {
        return this.departmentsService.update(id, updateDto, user);
    }

    @Patch(':id/assign-users')
    @ApiOperation({ summary: 'Assign users to department' })
    async assignUsers(
        @Param('id') id: string,
        @Body() assignDto: AssignUsersDto,
        @CurrentUser() user: User,
    ) {
        return this.departmentsService.assignUsers(id, assignDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete department' })
    async delete(@Param('id') id: string, @CurrentUser() user: User) {
        return this.departmentsService.delete(id, user);
    }
}
