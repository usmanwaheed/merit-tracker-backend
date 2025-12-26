import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminTransactionsQueryDto } from './dto/superadmin-transactions.dto';

@Injectable()
export class SuperadminTransactionsService {
    constructor(private readonly prisma: PrismaService) { }

    async listTransactions(query: SuperadminTransactionsQueryDto) {
        const filters: Prisma.Sql[] = [];

        if (query.search) {
            const search = `%${query.search.toLowerCase()}%`;
            filters.push(Prisma.sql`LOWER(c."name") LIKE ${search}`);
        }

        if (query.status) {
            filters.push(Prisma.sql`LOWER(t."status") = ${query.status}`);
        }

        if (query.type) {
            filters.push(Prisma.sql`LOWER(t."description") LIKE ${`%${query.type}%`}`);
        }

        if (query.range && query.range !== 'all') {
            const days = query.range === '7d' ? 7 : query.range === '30d' ? 30 : 90;
            filters.push(Prisma.sql`t."createdAt" >= NOW() - INTERVAL '${days} days'`);
        }

        const whereClause = filters.length
            ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
            : Prisma.sql``;

        const transactions = await this.prisma.$queryRaw<
            Array<{
                id: string;
                companyName: string;
                planName: string;
                amount: number;
                status: string;
                billingCycle: string;
                paymentMethod: string | null;
                description: string | null;
                createdAt: Date;
            }>
        >(Prisma.sql`
            SELECT t."id",
                   c."name" AS "companyName",
                   t."planName",
                   t."amount",
                   t."status",
                   t."billingCycle",
                   t."paymentMethod",
                   t."description",
                   t."createdAt"
            FROM "subscription_transactions" t
            JOIN "companies" c ON c."id" = t."companyId"
            ${whereClause}
            ORDER BY t."createdAt" DESC
        `);

        return transactions.map((transaction) => ({
            id: transaction.id,
            company: transaction.companyName,
            type: transaction.amount >= 0 ? 'payment' : 'refund',
            amount: transaction.amount,
            status: transaction.status,
            date: transaction.createdAt,
            method: transaction.paymentMethod ?? 'Not set',
            description: transaction.description ?? `${transaction.planName} subscription`,
        }));
    }
}