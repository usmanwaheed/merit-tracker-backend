// src/modules/activity-logs/activity-logs.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, ActivityType } from '@prisma/client';
import { CreateActivityLogDto, ActivityLogQueryDto } from './dto/activity-logs.dto';

@Injectable()
export class ActivityLogsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateActivityLogDto, companyId: string) {
        return this.prisma.activityLog.create({ data: { ...dto, companyId } });
    }

    async findAll(companyId: string, query: ActivityLogQueryDto, currentUserRole: UserRole) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can view activity logs');
        const where: any = { companyId };
        if (query.activityType) where.activityType = query.activityType;
        if (query.userId) where.userId = query.userId;
        if (query.startDate) where.createdAt = { gte: new Date(query.startDate) };
        if (query.endDate) where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };
        return this.prisma.activityLog.findMany({ where, include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 500 });
    }

    async findByUser(userId: string, companyId: string, currentUserId: string, currentUserRole: UserRole) {
        if (currentUserRole === UserRole.USER && userId !== currentUserId) throw new ForbiddenException('You can only view your own activity');
        return this.prisma.activityLog.findMany({ where: { companyId, userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    }

    async getStats(companyId: string, currentUserRole: UserRole) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can view stats');
        const [byType, topUsers, recentCount] = await Promise.all([
            this.prisma.activityLog.groupBy({ by: ['activityType'], where: { companyId }, _count: true }),
            this.prisma.activityLog.groupBy({ by: ['userId'], where: { companyId, userId: { not: null } }, _count: true, orderBy: { _count: { userId: 'desc' } }, take: 10 }),
            this.prisma.activityLog.count({ where: { companyId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
        ]);
        const userIds = topUsers.map((u) => u.userId).filter((id): id is string => id !== null);
        const users = await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } });
        return { byType: byType.map((t) => ({ type: t.activityType, count: t._count })), topUsers: topUsers.map((u) => ({ user: users.find((usr) => usr.id === u.userId), activityCount: u._count })), last24Hours: recentCount };
    }

    // Helper methods
    async logLogin(userId: string, companyId: string, ipAddress?: string) {
        return this.create({ activityType: ActivityType.USER_LOGIN, description: 'User logged in', userId, ipAddress }, companyId);
    }

    async logProjectCreated(userId: string, companyId: string, projectId: string, projectName: string) {
        return this.create({ activityType: ActivityType.PROJECT_CREATED, description: `Project "${projectName}" created`, userId, metadata: { projectId, projectName } }, companyId);
    }

    async logSopCreated(userId: string, companyId: string, sopId: string, sopTitle: string) {
        return this.create({ activityType: ActivityType.SOP_CREATED, description: `SOP "${sopTitle}" created`, userId, metadata: { sopId, sopTitle } }, companyId);
    }

    async logTimeTrackingStart(userId: string, companyId: string, subProjectId: string, taskTitle: string) {
        return this.create({ activityType: ActivityType.TIME_TRACKING_START, description: `Started tracking time on "${taskTitle}"`, userId, metadata: { subProjectId, taskTitle } }, companyId);
    }

    async logTimeTrackingEnd(userId: string, companyId: string, subProjectId: string, taskTitle: string, durationMinutes: number) {
        return this.create({ activityType: ActivityType.TIME_TRACKING_END, description: `Stopped tracking time on "${taskTitle}" (${durationMinutes} min)`, userId, metadata: { subProjectId, taskTitle, durationMinutes } }, companyId);
    }
}