import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminCreatePlanDto, SuperadminUpdatePlanDto } from './dto/superadmin-plans.dto';

@Injectable()
export class SuperadminPlansService {
    constructor(private readonly prisma: PrismaService) { }

    async listPlans() {
        const plans = await this.prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                description: string | null;
                monthlyPrice: number;
                yearlyPrice: number;
                userLimit: number;
                features: string[];
                isPopular: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }>
        >(Prisma.sql`
            SELECT "id", "name", "description", "monthlyPrice", "yearlyPrice", "userLimit", "features",
                   "isPopular", "isActive", "createdAt", "updatedAt"
            FROM "subscription_plans"
            ORDER BY "monthlyPrice" ASC
        `);

        const subscribersByPlan = await this.prisma.$queryRaw<
            Array<{ plan: string; subscribers: number }>
        >(Prisma.sql`
            SELECT UPPER("subscriptionPlan") AS "plan", COUNT(*)::int AS "subscribers"
            FROM "companies"
            GROUP BY UPPER("subscriptionPlan")
        `);

        return plans.map((plan) => {
            const subscribers = subscribersByPlan.find((item) => item.plan === plan.name.toUpperCase());
            return {
                ...plan,
                subscribers: subscribers?.subscribers ?? 0,
            };
        });
    }

    async createPlan(dto: SuperadminCreatePlanDto) {
        const existing = await this.prisma.$queryRaw<
            Array<{ id: string }>
        >(Prisma.sql`
            SELECT "id"
            FROM "subscription_plans"
            WHERE LOWER("name") = LOWER(${dto.name})
            LIMIT 1
        `);

        if (existing.length > 0) {
            throw new ConflictException('Plan name already exists');
        }

        const isPopular = dto.isPopular ?? false;
        const isActive = dto.isActive ?? true;

        const plans = await this.prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                description: string | null;
                monthlyPrice: number;
                yearlyPrice: number;
                userLimit: number;
                features: string[];
                isPopular: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }>
        >(Prisma.sql`
            INSERT INTO "subscription_plans"
                ("name", "description", "monthlyPrice", "yearlyPrice", "userLimit", "features", "isPopular", "isActive")
            VALUES
                (${dto.name}, ${dto.description ?? null}, ${dto.monthlyPrice}, ${dto.yearlyPrice},
                 ${dto.userLimit}, ${dto.features}, ${isPopular}, ${isActive})
            RETURNING "id", "name", "description", "monthlyPrice", "yearlyPrice", "userLimit", "features",
                      "isPopular", "isActive", "createdAt", "updatedAt"
        `);

        return plans[0];
    }

    async updatePlan(planId: string, dto: SuperadminUpdatePlanDto) {
        const existing = await this.prisma.$queryRaw<
            Array<{ id: string }>
        >(Prisma.sql`
            SELECT "id"
            FROM "subscription_plans"
            WHERE "id" = ${planId}
            LIMIT 1
        `);

        if (existing.length === 0) {
            throw new NotFoundException('Plan not found');
        }

        const plan = await this.prisma.$queryRaw<
            Array<{
                id: string;
                name: string;
                description: string | null;
                monthlyPrice: number;
                yearlyPrice: number;
                userLimit: number;
                features: string[];
                isPopular: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }>
        >(Prisma.sql`
            UPDATE "subscription_plans"
            SET "name" = COALESCE(${dto.name}, "name"),
                "description" = COALESCE(${dto.description ?? null}, "description"),
                "monthlyPrice" = COALESCE(${dto.monthlyPrice}, "monthlyPrice"),
                "yearlyPrice" = COALESCE(${dto.yearlyPrice}, "yearlyPrice"),
                "userLimit" = COALESCE(${dto.userLimit}, "userLimit"),
                "features" = COALESCE(${dto.features}, "features"),
                "isPopular" = COALESCE(${dto.isPopular}, "isPopular"),
                "isActive" = COALESCE(${dto.isActive}, "isActive"),
                "updatedAt" = NOW()
            WHERE "id" = ${planId}
            RETURNING "id", "name", "description", "monthlyPrice", "yearlyPrice", "userLimit", "features",
                      "isPopular", "isActive", "createdAt", "updatedAt"
        `);

        return plan[0];
    }

    async deletePlan(planId: string) {
        const result = await this.prisma.$executeRaw(Prisma.sql`
            DELETE FROM "subscription_plans"
            WHERE "id" = ${planId}
        `);

        if (!result) {
            throw new NotFoundException('Plan not found');
        }

        return { success: true };
    }
}