
// src/modules/companies/companies.controller.ts
import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UpdateCompanyDto } from './dto/companies.dto';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get('my-company')
    @ApiOperation({ summary: 'Get current user company' })
    async getMyCompany(@CurrentUser() user: User) {
        return this.companiesService.findOne(user.companyId);
    }

    @Get('my-company/stats')
    @ApiOperation({ summary: 'Get company statistics' })
    async getCompanyStats(@CurrentUser() user: User) {
        return this.companiesService.getCompanyStats(user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update company details' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateCompanyDto,
        @CurrentUser() user: User,
    ) {
        return this.companiesService.update(id, updateDto, user);
    }
}