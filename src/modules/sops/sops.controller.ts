// src/modules/sops/sops.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SopsService } from './sops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CreateSopDto, UpdateSopDto, ApproveSopDto, RejectSopDto, SopQueryDto } from './dto/sops.dto';
import { CurrentUser, Roles } from '../auth/guards';

@ApiTags('sops')
@Controller('sops')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SopsController {
    constructor(private readonly sopsService: SopsService) { }

    @Post() @ApiOperation({ summary: 'Create a new SOP' })
    async create(@Body() createDto: CreateSopDto, @CurrentUser('id') userId: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.create(createDto, userId, companyId); }

    @Get() @ApiOperation({ summary: 'Get all SOPs' })
    async findAll(@CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string, @Query() query: SopQueryDto) { return role === UserRole.USER ? this.sopsService.findApproved(companyId, query) : this.sopsService.findAll(companyId, query); }

    @Get('approved') @ApiOperation({ summary: 'Get all approved SOPs' })
    async findApproved(@CurrentUser('companyId') companyId: string, @Query() query: SopQueryDto) { return this.sopsService.findApproved(companyId, query); }

    @Get('pending') @UseGuards(RolesGuard) @Roles(UserRole.QC_ADMIN, UserRole.COMPANY_ADMIN) @ApiOperation({ summary: 'Get all pending SOPs' })
    async findPending(@CurrentUser('companyId') companyId: string) { return this.sopsService.findPendingApproval(companyId); }

    @Get('stats') @UseGuards(RolesGuard) @Roles(UserRole.QC_ADMIN, UserRole.COMPANY_ADMIN) @ApiOperation({ summary: 'Get SOP statistics' })
    async getStats(@CurrentUser('companyId') companyId: string) { return this.sopsService.getStats(companyId); }

    @Get(':id') @ApiOperation({ summary: 'Get SOP by ID' })
    async findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.findOne(id, companyId); }

    @Put(':id') @ApiOperation({ summary: 'Update SOP' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateSopDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.update(id, updateDto, userId, role as any, companyId); }

    @Patch(':id/approve') @UseGuards(RolesGuard) @Roles(UserRole.QC_ADMIN, UserRole.COMPANY_ADMIN) @ApiOperation({ summary: 'Approve SOP' })
    async approve(@Param('id') id: string, @Body() dto: ApproveSopDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.approve(id, dto, userId, role as any, companyId); }

    @Patch(':id/reject') @UseGuards(RolesGuard) @Roles(UserRole.QC_ADMIN, UserRole.COMPANY_ADMIN) @ApiOperation({ summary: 'Reject SOP' })
    async reject(@Param('id') id: string, @Body() dto: RejectSopDto, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.reject(id, dto, role as any, companyId); }

    @Patch(':id/view') @ApiOperation({ summary: 'Increment view count' })
    async incrementView(@Param('id') id: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.incrementViewCount(id, companyId); }

    @Delete(':id') @ApiOperation({ summary: 'Delete SOP' })
    async delete(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) { return this.sopsService.delete(id, userId, role as any, companyId); }
}