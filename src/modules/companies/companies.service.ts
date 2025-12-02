// src/modules/companies/companies.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../entities/company.entity';
import { User, UserRole } from '../../entities/user.entity';
import { UpdateCompanyDto } from './dto/companies.dto';

@Injectable()
export class CompaniesService {
    constructor(
        @InjectRepository(Company)
        private companiesRepository: Repository<Company>,
    ) { }

    async findOne(id: string): Promise<Company> {
        const company = await this.companiesRepository.findOne({
            where: { id },
            relations: ['users', 'departments', 'projects'],
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return company;
    }

    async update(id: string, updateDto: UpdateCompanyDto, currentUser: User): Promise<Company> {
        if (currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can update company details');
        }

        const company = await this.findOne(id);
        Object.assign(company, updateDto);
        return this.companiesRepository.save(company);
    }

    async getCompanyStats(companyId: string) {
        const company = await this.companiesRepository.findOne({
            where: { id: companyId },
            relations: ['users', 'departments', 'projects', 'sops'],
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return {
            totalUsers: company.users?.length || 0,
            activeUsers: company.users?.filter(u => u.isActive).length || 0,
            totalDepartments: company.departments?.length || 0,
            totalProjects: company.projects?.length || 0,
            totalSops: company.sops?.length || 0,
            subscriptionStatus: company.subscriptionStatus,
            trialEndsAt: company.trialEndsAt,
        };
    }
}