// src/modules/time-tracking/time-tracking.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StartTimeTrackingDto, StopTimeTrackingDto, UpdateTimeTrackingDto, AddScreenshotDto, TimeTrackingQueryDto, ManualTimeEntryDto } from './dto/time-tracking.dto';
import { CurrentUser } from '../auth/guards';

@ApiTags('time-tracking')
@Controller('time-tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeTrackingController {
    constructor(private readonly timeTrackingService: TimeTrackingService) { }

    @Post('start')
    @ApiOperation({ summary: 'Start time tracking for a task' })
    async start(@Body() dto: StartTimeTrackingDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.start(dto, userId, role as any, companyId);
    }

    @Post(':id/stop')
    @ApiOperation({ summary: 'Stop specific time tracking session' })
    async stop(@Param('id') id: string, @Body() dto: StopTimeTrackingDto, @CurrentUser('id') userId: string) {
        return this.timeTrackingService.stop(id, dto, userId);
    }

    @Post('stop-active')
    @ApiOperation({ summary: 'Stop current active timer (works from any device)' })
    async stopActive(@Body() dto: StopTimeTrackingDto, @CurrentUser('id') userId: string) {
        return this.timeTrackingService.stopActive(dto, userId);
    }

    @Get('active')
    @ApiOperation({ summary: 'Get current active timer status (for cross-device sync)' })
    async getActiveTimer(@CurrentUser('id') userId: string) {
        return this.timeTrackingService.getActiveTimer(userId);
    }

    @Get()
    @ApiOperation({ summary: 'Get time tracking history' })
    async findAll(@Query() query: TimeTrackingQueryDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.findAll(query, userId, role as any, companyId);
    }

    @Get('my-summary')
    @ApiOperation({ summary: 'Get current user time tracking summary' })
    async getMySummary(@CurrentUser('id') userId: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.getUserSummary(userId, companyId);
    }

    @Get('user/:userId/summary')
    @ApiOperation({ summary: 'Get user time tracking summary (admin only)' })
    async getUserSummary(@Param('userId') targetUserId: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.getUserSummary(targetUserId, companyId);
    }

    @Get('project/:projectId/summary')
    @ApiOperation({ summary: 'Get project time tracking summary' })
    async getProjectSummary(@Param('projectId') projectId: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.getProjectSummary(projectId, companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get time tracking entry by ID' })
    async findOne(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.findOne(id, userId, role as any, companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update time tracking entry' })
    async update(@Param('id') id: string, @Body() dto: UpdateTimeTrackingDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.update(id, dto, userId, role as any, companyId);
    }

    @Patch(':id/screenshot')
    @ApiOperation({ summary: 'Add screenshot to active timer' })
    async addScreenshot(@Param('id') id: string, @Body() dto: AddScreenshotDto, @CurrentUser('id') userId: string) {
        return this.timeTrackingService.addScreenshot(id, dto, userId);
    }

    @Post('manual')
    @ApiOperation({ summary: 'Create manual time entry (admin only)' })
    async createManualEntry(@Body() dto: ManualTimeEntryDto, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.createManualEntry(dto, userId, role as any, companyId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete time tracking entry' })
    async delete(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') role: string, @CurrentUser('companyId') companyId: string) {
        return this.timeTrackingService.delete(id, userId, role as any, companyId);
    }
}