import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminAnalyticsQueryDto } from './dto/superadmin-analytics.dto';
import { SuperadminAnalyticsService } from './superadmin-analytics.service';

@ApiTags('superadmin-analytics')
@ApiBearerAuth()
@Controller('superadmin/analytics')
@UseGuards(SuperadminJwtGuard)
export class SuperadminAnalyticsController {
    constructor(private readonly analyticsService: SuperadminAnalyticsService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Get platform analytics' })
    async getAnalytics(@Query() query: SuperadminAnalyticsQueryDto) {
        return this.analyticsService.getAnalytics(query);
    }
}