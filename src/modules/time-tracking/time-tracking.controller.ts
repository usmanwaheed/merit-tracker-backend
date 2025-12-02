
// src/modules/time-tracking/time-tracking.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeTrackingService } from './time-tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { StartTrackingDto, StopTrackingDto, AddScreenshotDto } from './dto/time-tracking.dto';

@ApiTags('time-tracking')
@Controller('time-tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeTrackingController {
    constructor(private readonly timeTrackingService: TimeTrackingService) { }

    @Post('start')
    @ApiOperation({ summary: 'Start time tracking' })
    async startTracking(@Body() startDto: StartTrackingDto, @CurrentUser() user: User) {
        return this.timeTrackingService.startTracking(startDto, user);
    }

    @Patch(':id/stop')
    @ApiOperation({ summary: 'Stop time tracking' })
    async stopTracking(
        @Param('id') id: string,
        @Body() stopDto: StopTrackingDto,
        @CurrentUser() user: User,
    ) {
        return this.timeTrackingService.stopTracking(id, stopDto, user);
    }

    @Patch(':id/screenshot')
    @ApiOperation({ summary: 'Add screenshot to tracking session' })
    async addScreenshot(
        @Param('id') id: string,
        @Body() screenshotDto: AddScreenshotDto,
        @CurrentUser() user: User,
    ) {
        return this.timeTrackingService.addScreenshot(id, screenshotDto, user);
    }

    @Get('active')
    @ApiOperation({ summary: 'Get my active tracking session' })
    async getMyActiveTracking(@CurrentUser() user: User) {
        return this.timeTrackingService.getMyActiveTracking(user);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get my tracking history' })
    async getMyHistory(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @CurrentUser() user: User,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.timeTrackingService.getMyTrackingHistory(user, start, end);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get project time tracking' })
    async getProjectTracking(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.timeTrackingService.getProjectTimeTracking(projectId, user.companyId);
    }
}
