// src/modules/departments/departments.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateDepartmentDto, UpdateDepartmentDto, AssignUsersDto } from './dto/departments.dto';
import { CurrentUser } from '../auth/guards';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
    constructor(private readonly departmentsService: DepartmentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new department' })
    async create(
        @Body() createDto: CreateDepartmentDto,
        @CurrentUser('role') currentUserRole: string,
        @CurrentUser('companyId') companyId: string,
    ) {
        return this.departmentsService.create(createDto, currentUserRole as any, companyId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all departments in company' })
    async findAll(@CurrentUser('companyId') companyId: string) {
        return this.departmentsService.findAll(companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get department by ID' })
    async findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
        return this.departmentsService.findOne(id, companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update department' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateDepartmentDto,
        @CurrentUser('role') currentUserRole: string,
        @CurrentUser('companyId') companyId: string,
    ) {
        return this.departmentsService.update(id, updateDto, currentUserRole as any, companyId);
    }

    @Patch(':id/assign-users')
    @ApiOperation({ summary: 'Assign users to department' })
    async assignUsers(
        @Param('id') id: string,
        @Body() assignDto: AssignUsersDto,
        @CurrentUser('role') currentUserRole: string,
        @CurrentUser('companyId') companyId: string,
    ) {
        return this.departmentsService.assignUsers(id, assignDto, currentUserRole as any, companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete department' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('role') currentUserRole: string,
        @CurrentUser('companyId') companyId: string,
    ) {
        return this.departmentsService.delete(id, currentUserRole as any, companyId);
    }
}