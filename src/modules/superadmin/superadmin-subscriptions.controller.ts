import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminSubscriptionsQueryDto } from './dto/superadmin-subscriptions.dto';
import { SuperadminSubscriptionsService } from './superadmin-subscriptions.service';

@ApiTags('superadmin-subscriptions')
@ApiBearerAuth()
@Controller('superadmin/subscriptions')
@UseGuards(SuperadminJwtGuard)
export class SuperadminSubscriptionsController {
    constructor(private readonly subscriptionsService: SuperadminSubscriptionsService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'List subscriptions' })
    async listSubscriptions(@Query() query: SuperadminSubscriptionsQueryDto) {
        return this.subscriptionsService.listSubscriptions(query);
    }
}