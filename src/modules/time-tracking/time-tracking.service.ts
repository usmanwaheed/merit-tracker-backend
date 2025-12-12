// src/modules/time-tracking/time-tracking.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { StartTimeTrackingDto, StopTimeTrackingDto, UpdateTimeTrackingDto, AddScreenshotDto, TimeTrackingQueryDto, ManualTimeEntryDto } from './dto/time-tracking.dto';

const POINTS_CONFIG = { MINUTES_PER_POINT: 30, MAX_POINTS_PER_SESSION: 16, MIN_MINUTES_FOR_POINT: 15 };

@Injectable()
export class TimeTrackingService {
    constructor(private prisma: PrismaService) { }

    async start(dto: StartTimeTrackingDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const subProject = await this.prisma.subProject.findFirst({ where: { id: dto.subProjectId, project: { companyId } }, include: { project: { include: { members: true } } } });
        if (!subProject) throw new NotFoundException('Task not found');

        const isMember = subProject.project.members.some((m) => m.userId === currentUserId);
        const isProjectLead = subProject.project.projectLeadId === currentUserId;
        const isAdmin = currentUserRole === UserRole.COMPANY_ADMIN || currentUserRole === UserRole.QC_ADMIN;
        if (!isMember && !isProjectLead && !isAdmin) throw new ForbiddenException('You must be a member of this project');

        const activeTimer = await this.prisma.timeTracking.findFirst({ where: { userId: currentUserId, isActive: true }, include: { subProject: { include: { project: { select: { id: true, name: true } } } } } });
        if (activeTimer) throw new ConflictException({ message: 'You already have an active timer', activeTimer: { id: activeTimer.id, subProjectId: activeTimer.subProjectId, subProjectTitle: activeTimer.subProject.title, projectId: activeTimer.subProject.project.id, projectName: activeTimer.subProject.project.name, startTime: activeTimer.startTime, elapsedMinutes: this.calculateElapsedMinutes(activeTimer.startTime) } });

        return this.prisma.timeTracking.create({
            data: { userId: currentUserId, subProjectId: dto.subProjectId, startTime: new Date(), notes: dto.notes, isActive: true },
            include: { subProject: { include: { project: { select: { id: true, name: true } } } }, user: { select: { id: true, firstName: true, lastName: true } } },
        });
    }

    async stop(id: string, dto: StopTimeTrackingDto, currentUserId: string) {
        const timeTracking = await this.prisma.timeTracking.findFirst({ where: { id, userId: currentUserId, isActive: true }, include: { subProject: true } });
        if (!timeTracking) throw new NotFoundException('Active session not found');

        const endTime = new Date();
        const durationMinutes = this.calculateElapsedMinutes(timeTracking.startTime, endTime);
        const pointsEarned = this.calculatePoints(durationMinutes);

        return this.prisma.$transaction(async (prisma) => {
            const updated = await prisma.timeTracking.update({ where: { id }, data: { endTime, durationMinutes, isActive: false, notes: dto.notes || timeTracking.notes }, include: { subProject: { include: { project: { select: { id: true, name: true } } } } } });
            if (pointsEarned > 0) {
                await prisma.user.update({ where: { id: currentUserId }, data: { points: { increment: pointsEarned } } });
                await prisma.projectMember.updateMany({ where: { projectId: timeTracking.subProject.projectId, userId: currentUserId }, data: { pointsEarned: { increment: pointsEarned } } });
            }
            return { ...updated, pointsEarned };
        });
    }

    async stopActive(dto: StopTimeTrackingDto, currentUserId: string) {
        const activeTimer = await this.prisma.timeTracking.findFirst({ where: { userId: currentUserId, isActive: true } });
        if (!activeTimer) throw new NotFoundException('No active timer found');
        return this.stop(activeTimer.id, dto, currentUserId);
    }

    async getActiveTimer(currentUserId: string) {
        const activeTimer = await this.prisma.timeTracking.findFirst({ where: { userId: currentUserId, isActive: true }, include: { subProject: { include: { project: { select: { id: true, name: true } } } } } });
        if (!activeTimer) return { active: false, timer: null };
        const elapsedMinutes = this.calculateElapsedMinutes(activeTimer.startTime);
        return { active: true, timer: { id: activeTimer.id, subProjectId: activeTimer.subProjectId, subProjectTitle: activeTimer.subProject.title, projectId: activeTimer.subProject.project.id, projectName: activeTimer.subProject.project.name, startTime: activeTimer.startTime, elapsedMinutes, elapsedFormatted: this.formatDuration(elapsedMinutes), notes: activeTimer.notes, screenshots: activeTimer.screenshots } };
    }

    async findAll(query: TimeTrackingQueryDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const where: any = { subProject: { project: { companyId } } };
        if (currentUserRole === UserRole.USER) where.userId = currentUserId;
        else if (query.userId) where.userId = query.userId;
        if (query.subProjectId) where.subProjectId = query.subProjectId;
        if (query.activeOnly) where.isActive = true;
        if (query.startDate) where.startTime = { gte: new Date(query.startDate) };
        if (query.endDate) where.startTime = { ...where.startTime, lte: new Date(query.endDate) };

        return this.prisma.timeTracking.findMany({ where, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, subProject: { include: { project: { select: { id: true, name: true } } } } }, orderBy: { startTime: 'desc' }, take: 100 });
    }

    async findOne(id: string, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const timeTracking = await this.prisma.timeTracking.findFirst({ where: { id, subProject: { project: { companyId } } }, include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } }, subProject: { include: { project: { select: { id: true, name: true } } } } } });
        if (!timeTracking) throw new NotFoundException('Time tracking entry not found');
        if (currentUserRole === UserRole.USER && timeTracking.userId !== currentUserId) throw new ForbiddenException('Access denied');
        return timeTracking;
    }

    async update(id: string, dto: UpdateTimeTrackingDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const timeTracking = await this.findOne(id, currentUserId, currentUserRole, companyId);
        if (timeTracking.userId !== currentUserId && currentUserRole === UserRole.USER) throw new ForbiddenException('You can only update your own entries');
        return this.prisma.timeTracking.update({ where: { id }, data: dto });
    }

    async addScreenshot(id: string, dto: AddScreenshotDto, currentUserId: string) {
        const timeTracking = await this.prisma.timeTracking.findFirst({ where: { id, userId: currentUserId, isActive: true } });
        if (!timeTracking) throw new NotFoundException('Active session not found');
        return this.prisma.timeTracking.update({ where: { id }, data: { screenshots: { push: dto.screenshotUrl } } });
    }

    async createManualEntry(dto: ManualTimeEntryDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can create manual entries');
        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);
        if (endTime <= startTime) throw new BadRequestException('End time must be after start time');
        const durationMinutes = this.calculateElapsedMinutes(startTime, endTime);
        const subProject = await this.prisma.subProject.findFirst({ where: { id: dto.subProjectId, project: { companyId } } });
        if (!subProject) throw new NotFoundException('Task not found');
        return this.prisma.timeTracking.create({ data: { userId: currentUserId, subProjectId: dto.subProjectId, startTime, endTime, durationMinutes, notes: dto.notes, isActive: false }, include: { subProject: true } });
    }

    async delete(id: string, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const timeTracking = await this.findOne(id, currentUserId, currentUserRole, companyId);
        if (timeTracking.userId !== currentUserId && currentUserRole === UserRole.USER) throw new ForbiddenException('You can only delete your own entries');
        await this.prisma.timeTracking.delete({ where: { id } });
        return { message: 'Time tracking entry deleted' };
    }

    async getUserSummary(userId: string, companyId: string) {
        const where = { userId, isActive: false, subProject: { project: { companyId } } };
        const [entries, totals] = await Promise.all([this.prisma.timeTracking.findMany({ where, include: { subProject: { include: { project: { select: { id: true, name: true } } } } }, orderBy: { startTime: 'desc' } }), this.prisma.timeTracking.aggregate({ where, _sum: { durationMinutes: true }, _count: true })]);
        const totalMinutes = totals._sum.durationMinutes || 0;
        return { entries, summary: { totalSessions: totals._count, totalMinutes, totalHours: Math.round(totalMinutes / 60 * 100) / 100, totalFormatted: this.formatDuration(totalMinutes) } };
    }

    async getProjectSummary(projectId: string, companyId: string) {
        const project = await this.prisma.project.findFirst({ where: { id: projectId, companyId } });
        if (!project) throw new NotFoundException('Project not found');
        const [byUser, byTask, totals] = await Promise.all([
            this.prisma.timeTracking.groupBy({ by: ['userId'], where: { subProject: { projectId }, isActive: false }, _sum: { durationMinutes: true }, _count: true }),
            this.prisma.timeTracking.groupBy({ by: ['subProjectId'], where: { subProject: { projectId }, isActive: false }, _sum: { durationMinutes: true }, _count: true }),
            this.prisma.timeTracking.aggregate({ where: { subProject: { projectId }, isActive: false }, _sum: { durationMinutes: true }, _count: true })
        ]);
        const userIds = byUser.map((u) => u.userId);
        const taskIds = byTask.map((t) => t.subProjectId);
        const [users, tasks] = await Promise.all([this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, avatar: true } }), this.prisma.subProject.findMany({ where: { id: { in: taskIds } }, select: { id: true, title: true } })]);
        const totalMinutes = totals._sum.durationMinutes || 0;
        return { projectId, summary: { totalSessions: totals._count, totalMinutes, totalHours: Math.round(totalMinutes / 60 * 100) / 100, totalFormatted: this.formatDuration(totalMinutes) }, byUser: byUser.map((u) => ({ user: users.find((usr) => usr.id === u.userId), sessions: u._count, totalMinutes: u._sum.durationMinutes || 0, totalHours: Math.round((u._sum.durationMinutes || 0) / 60 * 100) / 100 })), byTask: byTask.map((t) => ({ task: tasks.find((tsk) => tsk.id === t.subProjectId), sessions: t._count, totalMinutes: t._sum.durationMinutes || 0, totalHours: Math.round((t._sum.durationMinutes || 0) / 60 * 100) / 100 })) };
    }

    private calculateElapsedMinutes(startTime: Date, endTime?: Date): number { return Math.floor(((endTime || new Date()).getTime() - new Date(startTime).getTime()) / 1000 / 60); }
    private calculatePoints(durationMinutes: number): number { if (durationMinutes < POINTS_CONFIG.MIN_MINUTES_FOR_POINT) return 0; return Math.min(Math.floor(durationMinutes / POINTS_CONFIG.MINUTES_PER_POINT), POINTS_CONFIG.MAX_POINTS_PER_SESSION); }
    private formatDuration(minutes: number): string { const hours = Math.floor(minutes / 60); const mins = minutes % 60; return hours === 0 ? `${mins}m` : `${hours}h ${mins}m`; }
}