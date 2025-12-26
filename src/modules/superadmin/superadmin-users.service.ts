import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SuperadminUserRoleFilter, SuperadminUsersQueryDto } from './dto/superadmin-users.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SuperadminUsersService {
    constructor(private readonly prisma: PrismaService) { }

    async listUsers(query: SuperadminUsersQueryDto) {
        const where: any = {};

        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { company: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }

        if (query.role) {
            where.role = this.mapRole(query.role);
        }

        if (query.status) {
            if (query.status === 'pending') {
                where.isActive = false;
            } else if (query.status === 'inactive') {
                where.isActive = false;
            } else if (query.status === 'active') {
                where.isActive = true;
            }
        }

        const users = await this.prisma.user.findMany({
            where,
            include: {
                company: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            company: user.company?.name ?? null,
            role: this.mapRoleLabel(user.role),
            status: user.isActive ? 'active' : 'suspended',
            lastActive: user.updatedAt,
            avatar: user.avatar,
        }));
    }

    private mapRole(role: SuperadminUserRoleFilter) {
        switch (role) {
            case SuperadminUserRoleFilter.OWNER:
            case SuperadminUserRoleFilter.ADMIN:
                return UserRole.COMPANY_ADMIN;
            case SuperadminUserRoleFilter.MEMBER:
            default:
                return UserRole.USER;
        }
    }

    private mapRoleLabel(role: UserRole) {
        if (role === UserRole.COMPANY_ADMIN) {
            return 'Admin';
        }

        if (role === UserRole.QC_ADMIN) {
            return 'Owner';
        }

        return 'Member';
    }
}