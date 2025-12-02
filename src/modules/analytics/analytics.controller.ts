
// src/modules/analytics/analytics.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get company dashboard analytics' })
    async getCompanyDashboard(@CurrentUser() user: User) {
        return this.analyticsService.getCompanyDashboard(user.companyId);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get user analytics' })
    async getUserAnalytics(
        @Param('userId') userId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.analyticsService.getUserAnalytics(userId, start, end);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get project analytics' })
    async getProjectAnalytics(@Param('projectId') projectId: string, @CurrentUser() user: User) {
        return this.analyticsService.getProjectAnalytics(projectId, user.companyId);
    }

    @Get('department/:departmentId')
    @ApiOperation({ summary: 'Get department analytics' })
    async getDepartmentAnalytics(@Param('departmentId') departmentId: string, @CurrentUser() user: User) {
        return this.analyticsService.getDepartmentAnalytics(departmentId, user.companyId);
    }

    @Get('time-tracking-report')
    @ApiOperation({ summary: 'Get time tracking report' })
    async getTimeTrackingReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @CurrentUser() user: User,
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.analyticsService.getTimeTrackingReport(user.companyId, start, end);
    }
}
