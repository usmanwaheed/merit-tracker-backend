import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, SubscriptionStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
    SuperadminCompaniesQueryDto,
    SuperadminCompanyPlan,
    SuperadminCompanyStatus,
    SuperadminCreateCompanyDto,
} from './dto/superadmin-companies.dto';

@Injectable()
export class SuperadminCompaniesService {
    constructor(private readonly prisma: PrismaService) { }

    async listCompanies(query: SuperadminCompaniesQueryDto) {
        const where: Prisma.CompanyWhereInput = {};

        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }

        if (query.plan) {
            (where as Prisma.CompanyWhereInput & { subscriptionPlan?: string }).subscriptionPlan =
                this.mapPlan(query.plan);
        }

        if (query.status) {
            if (query.status === SuperadminCompanyStatus.SUSPENDED) {
                where.isActive = false;
            } else if (query.status === SuperadminCompanyStatus.TRIAL) {
                where.isActive = true;
                where.subscriptionStatus = SubscriptionStatus.TRIAL;
            } else if (query.status === SuperadminCompanyStatus.ACTIVE) {
                where.isActive = true;
                where.subscriptionStatus = SubscriptionStatus.ACTIVE;
            }
        }

        const companies = await this.prisma.company.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                users: {
                    where: { role: UserRole.COMPANY_ADMIN },
                    select: { email: true, firstName: true, lastName: true },
                    take: 1,
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        return companies.map((company) => {
            const admin = company.users[0];
            return {
                id: company.id,
                name: company.name,
                email: admin?.email ?? null,
                plan: (company as { subscriptionPlan?: string }).subscriptionPlan ?? 'STARTER',
                users: company._count.users,
                maxUsers: (company as { maxUsers?: number }).maxUsers ?? 0,
                status: this.mapStatus(company),
                createdAt: company.createdAt,
            };
        });
    }

    async createCompany(dto: SuperadminCreateCompanyDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.adminEmail },
        });
        if (existingUser) {
            throw new ConflictException('Admin email already exists');
        }

        const existingCompany = await this.prisma.company.findUnique({
            where: { name: dto.name },
        });
        if (existingCompany) {
            throw new ConflictException('Company name already exists');
        }

        const companyCode = await this.generateUniqueCompanyCode();
        const plainPassword = this.generateTempPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const subscriptionPlan = this.mapPlan(dto.plan);
        const maxUsers = this.mapMaxUsers(subscriptionPlan);

        const adminFirstName = dto.adminFirstName || 'Admin';
        const adminLastName = dto.adminLastName || 'User';

        const result = await this.prisma.$transaction(async (prisma) => {
            const companyData = {
                name: dto.name,
                companyCode,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionPlan,
                maxUsers,
                isActive: true,
            } as Prisma.CompanyCreateInput & { subscriptionPlan?: string; maxUsers?: number };

            const company = await prisma.company.create({
                data: companyData,
            });

            const adminUser = await prisma.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    role: UserRole.COMPANY_ADMIN,
                    companyId: company.id,
                    isActive: true,
                },
            });

            return { company, adminUser };
        });

        return {
            company: {
                id: result.company.id,
                name: result.company.name,
                companyCode: result.company.companyCode,
                plan: (result.company as { subscriptionPlan?: string }).subscriptionPlan ?? 'STARTER',
                maxUsers: (result.company as { maxUsers?: number }).maxUsers ?? maxUsers,
                status: this.mapStatus(result.company),
            },
            admin: {
                id: result.adminUser.id,
                email: result.adminUser.email,
                firstName: result.adminUser.firstName,
                lastName: result.adminUser.lastName,
                tempPassword: plainPassword,
            },
        };
    }

    private mapPlan(plan: SuperadminCompanyPlan) {
        switch (plan) {
            case SuperadminCompanyPlan.PRO:
                return 'PRO';
            case SuperadminCompanyPlan.ENTERPRISE:
                return 'ENTERPRISE';
            case SuperadminCompanyPlan.STARTER:
            default:
                return 'STARTER';
        }
    }

    private mapMaxUsers(plan: string) {
        switch (plan) {
            case 'PRO':
                return 25;
            case 'ENTERPRISE':
                return 100;
            case 'STARTER':
            default:
                return 5;
        }
    }

    private mapStatus(company: { isActive: boolean; subscriptionStatus: SubscriptionStatus }) {
        if (!company.isActive) {
            return SuperadminCompanyStatus.SUSPENDED;
        }

        if (company.subscriptionStatus === SubscriptionStatus.TRIAL) {
            return SuperadminCompanyStatus.TRIAL;
        }

        return SuperadminCompanyStatus.ACTIVE;
    }

    private async generateUniqueCompanyCode(): Promise<string> {
        let companyCode = '';
        let isUnique = false;

        while (!isUnique) {
            companyCode = randomBytes(4).toString('hex').toUpperCase();
            const existingCompany = await this.prisma.company.findUnique({
                where: { companyCode },
            });

            if (!existingCompany) {
                isUnique = true;
            }
        }

        return companyCode;
    }

    private generateTempPassword(): string {
        return randomBytes(6).toString('base64url');
    }
}