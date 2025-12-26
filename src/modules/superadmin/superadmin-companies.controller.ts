import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminCompaniesService } from './superadmin-companies.service';
import { SuperadminCompaniesQueryDto, SuperadminCreateCompanyDto } from './dto/superadmin-companies.dto';

@ApiTags('superadmin-companies')
@ApiBearerAuth()
@Controller('superadmin/companies')
@UseGuards(SuperadminJwtGuard)
export class SuperadminCompaniesController {
    constructor(private readonly companiesService: SuperadminCompaniesService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'List companies for superadmin' })
    async listCompanies(@Query() query: SuperadminCompaniesQueryDto) {
        return this.companiesService.listCompanies(query);
    }

    @Post()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Create a company with admin user' })
    async createCompany(@Body() dto: SuperadminCreateCompanyDto) {
        return this.companiesService.createCompany(dto);
    }
}