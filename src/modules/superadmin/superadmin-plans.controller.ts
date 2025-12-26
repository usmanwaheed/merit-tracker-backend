import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminCreatePlanDto, SuperadminUpdatePlanDto } from './dto/superadmin-plans.dto';
import { SuperadminPlansService } from './superadmin-plans.service';

@ApiTags('superadmin-plans')
@ApiBearerAuth()
@Controller('superadmin/plans')
@UseGuards(SuperadminJwtGuard)
export class SuperadminPlansController {
    constructor(private readonly plansService: SuperadminPlansService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'List subscription plans' })
    async listPlans() {
        return this.plansService.listPlans();
    }

    @Post()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Create a subscription plan' })
    async createPlan(@Body() dto: SuperadminCreatePlanDto) {
        return this.plansService.createPlan(dto);
    }

    @Put(':planId')
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Update a subscription plan' })
    async updatePlan(@Param('planId') planId: string, @Body() dto: SuperadminUpdatePlanDto) {
        return this.plansService.updatePlan(planId, dto);
    }

    @Delete(':planId')
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Delete a subscription plan' })
    async deletePlan(@Param('planId') planId: string) {
        return this.plansService.deletePlan(planId);
    }
}