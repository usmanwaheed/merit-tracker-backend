import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminUpdateSettingsDto } from './dto/superadmin-settings.dto';

@Injectable()
export class SuperadminSettingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getSettings() {
        const settings = await this.prisma.$queryRaw<
            Array<{
                id: string;
                platformName: string;
                supportEmail: string;
                platformDescription: string | null;
                defaultTimezone: string;
                defaultCurrency: string;
                stripePublicKey: string | null;
                stripeSecretKey: string | null;
                trialDays: number;
                autoRetryFailedPayments: boolean;
                autoInvoiceGeneration: boolean;
                primaryColor: string;
                theme: string;
                logoUrl: string | null;
                faviconUrl: string | null;
            }>
        >(Prisma.sql`
            SELECT "id",
                   "platformName",
                   "supportEmail",
                   "platformDescription",
                   "defaultTimezone",
                   "defaultCurrency",
                   "stripePublicKey",
                   "stripeSecretKey",
                   "trialDays",
                   "autoRetryFailedPayments",
                   "autoInvoiceGeneration",
                   "primaryColor",
                   "theme",
                   "logoUrl",
                   "faviconUrl"
            FROM "platform_settings"
            ORDER BY "createdAt" DESC
            LIMIT 1
        `);

        if (settings.length) {
            return settings[0];
        }

        return {
            platformName: 'MeritTracker',
            supportEmail: 'support@merittracker.com',
            platformDescription: null,
            defaultTimezone: 'utc',
            defaultCurrency: 'usd',
            stripePublicKey: null,
            stripeSecretKey: null,
            trialDays: 14,
            autoRetryFailedPayments: true,
            autoInvoiceGeneration: true,
            primaryColor: '#6366f1',
            theme: 'system',
            logoUrl: null,
            faviconUrl: null,
        };
    }

    async updateSettings(dto: SuperadminUpdateSettingsDto) {
        const existing = await this.prisma.$queryRaw<
            Array<{ id: string }>
        >(Prisma.sql`
            SELECT "id"
            FROM "platform_settings"
            ORDER BY "createdAt" DESC
            LIMIT 1
        `);

        if (!existing.length) {
            const inserted = await this.prisma.$queryRaw<
                Array<{ id: string }>
            >(Prisma.sql`
                INSERT INTO "platform_settings"
                    ("platformName", "supportEmail", "platformDescription", "defaultTimezone", "defaultCurrency",
                     "stripePublicKey", "stripeSecretKey", "trialDays", "autoRetryFailedPayments", "autoInvoiceGeneration",
                     "primaryColor", "theme", "logoUrl", "faviconUrl")
                VALUES
                    (${dto.platformName ?? 'MeritTracker'},
                     ${dto.supportEmail ?? 'support@merittracker.com'},
                     ${dto.platformDescription ?? null},
                     ${dto.defaultTimezone ?? 'utc'},
                     ${dto.defaultCurrency ?? 'usd'},
                     ${dto.stripePublicKey ?? null},
                     ${dto.stripeSecretKey ?? null},
                     ${dto.trialDays ?? 14},
                     ${dto.autoRetryFailedPayments ?? true},
                     ${dto.autoInvoiceGeneration ?? true},
                     ${dto.primaryColor ?? '#6366f1'},
                     ${dto.theme ?? 'system'},
                     ${dto.logoUrl ?? null},
                     ${dto.faviconUrl ?? null})
                RETURNING "id"
            `);

            return { id: inserted[0]?.id ?? null, ...dto };
        }

        await this.prisma.$executeRaw(Prisma.sql`
            UPDATE "platform_settings"
            SET "platformName" = COALESCE(${dto.platformName}, "platformName"),
                "supportEmail" = COALESCE(${dto.supportEmail}, "supportEmail"),
                "platformDescription" = COALESCE(${dto.platformDescription ?? null}, "platformDescription"),
                "defaultTimezone" = COALESCE(${dto.defaultTimezone}, "defaultTimezone"),
                "defaultCurrency" = COALESCE(${dto.defaultCurrency}, "defaultCurrency"),
                "stripePublicKey" = COALESCE(${dto.stripePublicKey ?? null}, "stripePublicKey"),
                "stripeSecretKey" = COALESCE(${dto.stripeSecretKey ?? null}, "stripeSecretKey"),
                "trialDays" = COALESCE(${dto.trialDays}, "trialDays"),
                "autoRetryFailedPayments" = COALESCE(${dto.autoRetryFailedPayments}, "autoRetryFailedPayments"),
                "autoInvoiceGeneration" = COALESCE(${dto.autoInvoiceGeneration}, "autoInvoiceGeneration"),
                "primaryColor" = COALESCE(${dto.primaryColor}, "primaryColor"),
                "theme" = COALESCE(${dto.theme}, "theme"),
                "logoUrl" = COALESCE(${dto.logoUrl ?? null}, "logoUrl"),
                "faviconUrl" = COALESCE(${dto.faviconUrl ?? null}, "faviconUrl"),
                "updatedAt" = NOW()
            WHERE "id" = ${existing[0].id}
        `);

        return { id: existing[0].id, ...dto };
    }
}