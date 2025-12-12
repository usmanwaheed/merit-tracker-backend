// src/modules/companies/companies.controller.ts
import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateCompanyDto } from './dto/companies.dto';
import { CurrentUser } from '../auth/guards';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get('my-company')
    @ApiOperation({ summary: 'Get current user company' })
    async getMyCompany(@CurrentUser('companyId') companyId: string) {
        return this.companiesService.findOne(companyId);
    }

    @Get('my-company/stats')
    @ApiOperation({ summary: 'Get company statistics' })
    async getCompanyStats(@CurrentUser('companyId') companyId: string) {
        return this.companiesService.getCompanyStats(companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update company details' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateCompanyDto,
        @CurrentUser('role') currentUserRole: string,
    ) {
        return this.companiesService.update(id, updateDto, currentUserRole as any);
    }
}