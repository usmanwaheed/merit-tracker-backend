import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminAnalyticsQueryDto } from './dto/superadmin-analytics.dto';

@Injectable()
export class SuperadminAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getAnalytics(_query: SuperadminAnalyticsQueryDto) {
        const [totalUsers, totalCompanies] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.company.count(),
        ]);

        const planDistribution = await this.prisma.$queryRaw<
            Array<{ plan: string; value: number }>
        >(Prisma.sql`
            SELECT COALESCE(UPPER("subscriptionPlan"), 'STARTER') AS "plan", COUNT(*)::int AS "value"
            FROM "companies"
            GROUP BY COALESCE(UPPER("subscriptionPlan"), 'STARTER')
        `);

        const topCompanies = await this.prisma.$queryRaw<
            Array<{ name: string; users: number }>
        >(Prisma.sql`
            SELECT c."name", COUNT(u."id")::int AS "users"
            FROM "companies" c
            LEFT JOIN "users" u ON u."companyId" = c."id"
            GROUP BY c."name"
            ORDER BY COUNT(u."id") DESC
            LIMIT 5
        `);

        return {
            summary: {
                totalUsers,
                totalCompanies,
            },
            planDistribution: planDistribution.map((plan) => ({
                name: this.capitalize(plan.plan),
                value: plan.value,
            })),
            topCompanies: topCompanies.map((company) => ({
                name: company.name,
                users: company.users,
            })),
        };
    }

    private capitalize(value: string) {
        const lower = value.toLowerCase();
        return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    }
}