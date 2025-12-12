// src/modules/notifications/notifications.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, NotificationType } from '@prisma/client';
import { CreateNotificationDto, BulkNotificationDto, NotificationQueryDto } from './dto/notifications.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateNotificationDto, currentUserRole: UserRole) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can create notifications');
        return this.prisma.notification.create({ data: dto });
    }

    async createBulk(dto: BulkNotificationDto, currentUserRole: UserRole) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can create notifications');
        const { userIds, ...notificationData } = dto;
        await this.prisma.notification.createMany({ data: userIds.map((userId) => ({ ...notificationData, userId })) });
        return { message: `Notifications sent to ${userIds.length} users` };
    }

    async findAll(userId: string, query?: NotificationQueryDto) {
        const where: any = { userId };
        if (query?.type) where.type = query.type;
        if (query?.unreadOnly) where.isRead = false;
        return this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
        return { unreadCount: count };
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
        if (!notification) throw new NotFoundException('Notification not found');
        return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
        return { message: 'All notifications marked as read' };
    }

    async delete(id: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
        if (!notification) throw new NotFoundException('Notification not found');
        await this.prisma.notification.delete({ where: { id } });
        return { message: 'Notification deleted' };
    }

    async deleteAllRead(userId: string) {
        const result = await this.prisma.notification.deleteMany({ where: { userId, isRead: true } });
        return { message: `${result.count} read notifications deleted` };
    }

    // Helper methods for creating specific notification types
    async notifyProjectAssignment(userId: string, projectId: string, projectName: string) {
        return this.prisma.notification.create({ data: { userId, type: NotificationType.PROJECT_ASSIGNMENT, title: 'New Project Assignment', message: `You have been assigned to project: ${projectName}`, metadata: { projectId } } });
    }

    async notifyTaskAssignment(userId: string, subProjectId: string, taskTitle: string, projectName: string) {
        return this.prisma.notification.create({ data: { userId, type: NotificationType.TASK_ASSIGNMENT, title: 'New Task Assignment', message: `You have been assigned to task: ${taskTitle} in ${projectName}`, metadata: { subProjectId } } });
    }

    async notifySopApproval(userId: string, sopId: string, sopTitle: string) {
        return this.prisma.notification.create({ data: { userId, type: NotificationType.SOP_APPROVAL, title: 'SOP Approved', message: `Your SOP "${sopTitle}" has been approved`, metadata: { sopId } } });
    }

    async notifySopRejection(userId: string, sopId: string, sopTitle: string, reason: string) {
        return this.prisma.notification.create({ data: { userId, type: NotificationType.SOP_REJECTION, title: 'SOP Rejected', message: `Your SOP "${sopTitle}" has been rejected: ${reason}`, metadata: { sopId, reason } } });
    }
}