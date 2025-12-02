
// src/modules/sops/sops.controller.ts
import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SopsService } from './sops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { CreateSopDto, UpdateSopDto, ApproveSopDto, RejectSopDto } from './dto/sops.dto';
import { SopStatus, SopType } from '../../entities/sop.entity';

@ApiTags('sops')
@Controller('sops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SopsController {
    constructor(private readonly sopsService: SopsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new SOP' })
    async create(@Body() createDto: CreateSopDto, @CurrentUser() user: User) {
        return this.sopsService.create(createDto, user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all SOPs' })
    @ApiQuery({ name: 'status', enum: SopStatus, required: false })
    @ApiQuery({ name: 'type', enum: SopType, required: false })
    async findAll(
        @Query('status') status: SopStatus,
        @Query('type') type: SopType,
        @CurrentUser() user: User,
    ) {
        return this.sopsService.findAll(user.companyId, status, type);
    }

    @Get('pending-approvals')
    @ApiOperation({ summary: 'Get pending approvals' })
    async getPendingApprovals(@CurrentUser() user: User) {
        return this.sopsService.getPendingApprovals(user.companyId);
    }

    @Get('analytics')
    @ApiOperation({ summary: 'Get SOP analytics' })
    async getAnalytics(@CurrentUser() user: User) {
        return this.sopsService.getAnalytics(user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get SOP by ID' })
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.sopsService.findOne(id, user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update SOP' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateSopDto,
        @CurrentUser() user: User,
    ) {
        return this.sopsService.update(id, updateDto, user);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve SOP' })
    async approve(
        @Param('id') id: string,
        @Body() approveDto: ApproveSopDto,
        @CurrentUser() user: User,
    ) {
        return this.sopsService.approve(id, approveDto, user);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject SOP' })
    async reject(
        @Param('id') id: string,
        @Body() rejectDto: RejectSopDto,
        @CurrentUser() user: User,
    ) {
        return this.sopsService.reject(id, rejectDto, user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete SOP' })
    async delete(@Param('id') id: string, @CurrentUser() user: User) {
        return this.sopsService.delete(id, user);
    }
}
