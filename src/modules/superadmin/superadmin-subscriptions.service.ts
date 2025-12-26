import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminSubscriptionsQueryDto } from './dto/superadmin-subscriptions.dto';

@Injectable()
export class SuperadminSubscriptionsService {
    constructor(private readonly prisma: PrismaService) { }

    async listSubscriptions(query: SuperadminSubscriptionsQueryDto) {
        const filters: Prisma.Sql[] = [];

        if (query.search) {
            const search = `%${query.search.toLowerCase()}%`;
            filters.push(Prisma.sql`LOWER(c."name") LIKE ${search}`);
        }

        if (query.plan) {
            filters.push(Prisma.sql`LOWER(c."subscriptionPlan") = ${query.plan}`);
        }

        const whereClause = filters.length
            ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
            : Prisma.sql``;

        const companies = await this.prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                subscriptionStatus: string;
                subscriptionPlan: string | null;
                subscriptionEndsAt: Date | null;
                trialEndsAt: Date | null;
                isActive: boolean;
                createdAt: Date;
            }>
        >(Prisma.sql`
            SELECT c."id",
                   c."name",
                   c."subscriptionStatus",
                   c."subscriptionPlan",
                   c."subscriptionEndsAt",
                   c."trialEndsAt",
                   c."isActive",
                   c."createdAt"
            FROM "companies" c
            ${whereClause}
            ORDER BY c."createdAt" DESC
        `);

        const plans = await this.prisma.$queryRaw<
            Array<{ name: string; monthlyPrice: number; yearlyPrice: number }>
        >(Prisma.sql`
            SELECT "name", "monthlyPrice", "yearlyPrice"
            FROM "subscription_plans"
        `);

        return companies.map((company) => {
            const planName = company.subscriptionPlan ?? 'starter';
            const plan = plans.find((item) => item.name.toLowerCase() === planName.toLowerCase());
            const billingCycle = query.billingCycle ?? 'monthly';
            const amount =
                billingCycle === 'yearly'
                    ? plan?.yearlyPrice ?? 0
                    : plan?.monthlyPrice ?? 0;

            return {
                id: `SUB-${company.id.slice(0, 6).toUpperCase()}`,
                company: company.name,
                plan: plan?.name ?? planName,
                amount,
                billingCycle,
                status: this.mapStatus(company),
                startDate: company.createdAt,
                nextBilling: company.subscriptionEndsAt ?? company.trialEndsAt ?? null,
                paymentMethod: 'Not set',
            };
        });
    }

    private mapStatus(company: { isActive: boolean; subscriptionStatus: string }) {
        if (!company.isActive) {
            return 'cancelled';
        }

        if (company.subscriptionStatus === 'TRIAL') {
            return 'trialing';
        }

        if (company.subscriptionStatus === 'ACTIVE') {
            return 'active';
        }

        return 'past_due';
    }
}