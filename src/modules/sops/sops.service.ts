// src/modules/sops/sops.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, SopStatus } from '@prisma/client';
import { CreateSopDto, UpdateSopDto, ApproveSopDto, RejectSopDto, SopQueryDto } from './dto/sops.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SopsService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateSopDto, currentUserId: string, companyId: string) {
        return this.prisma.sop.create({ data: { ...createDto, companyId, createdById: currentUserId, status: SopStatus.PENDING_APPROVAL }, include: { createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } } } });
    }

    async findAll(companyId: string, query?: SopQueryDto) {
        const where: any = { companyId };
        if (query?.type) where.type = query.type;
        if (query?.status) where.status = query.status;
        if (query?.search) where.OR = [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }];
        if (query?.tags?.length) where.tags = { hasSome: query.tags };
        return this.prisma.sop.findMany({ where, include: { createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } }, approvedBy: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } });
    }

    async findApproved(companyId: string, query?: SopQueryDto) { return this.findAll(companyId, { ...query, status: SopStatus.APPROVED }); }
    async findPendingApproval(companyId: string) { return this.prisma.sop.findMany({ where: { companyId, status: SopStatus.PENDING_APPROVAL }, include: { createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } } }, orderBy: { createdAt: 'asc' } }); }

    async findOne(id: string, companyId: string) {
        const sop = await this.prisma.sop.findFirst({ where: { id, companyId }, include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }, approvedBy: { select: { id: true, firstName: true, lastName: true } } } });
        if (!sop) throw new NotFoundException('SOP not found');
        return sop;
    }

    async update(id: string, updateDto: UpdateSopDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const sop = await this.findOne(id, companyId);
        if (sop.createdById !== currentUserId && currentUserRole === UserRole.USER) throw new ForbiddenException('You can only update your own SOPs');
        const status = sop.status === SopStatus.REJECTED ? SopStatus.PENDING_APPROVAL : sop.status;
        return this.prisma.sop.update({ where: { id }, data: { ...updateDto, status, rejectionReason: status === SopStatus.PENDING_APPROVAL ? null : sop.rejectionReason }, include: { createdBy: { select: { id: true, firstName: true, lastName: true, avatar: true } } } });
    }

    async approve(id: string, dto: ApproveSopDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can approve SOPs');
        const sop = await this.findOne(id, companyId);
        if (sop.status !== SopStatus.PENDING_APPROVAL) throw new ForbiddenException('SOP is not pending approval');
        return this.prisma.sop.update({ where: { id }, data: { status: SopStatus.APPROVED, approvedById: currentUserId, approvedAt: new Date(), rejectionReason: null }, include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, approvedBy: { select: { id: true, firstName: true, lastName: true } } } });
    }

    async reject(id: string, dto: RejectSopDto, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) throw new ForbiddenException('Only admins can reject SOPs');
        const sop = await this.findOne(id, companyId);
        if (sop.status !== SopStatus.PENDING_APPROVAL) throw new ForbiddenException('SOP is not pending approval');
        return this.prisma.sop.update({ where: { id }, data: { status: SopStatus.REJECTED, rejectionReason: dto.rejectionReason }, include: { createdBy: { select: { id: true, firstName: true, lastName: true } } } });
    }

    async incrementViewCount(id: string, companyId: string) { await this.findOne(id, companyId); return this.prisma.sop.update({ where: { id }, data: { viewCount: { increment: 1 } } }); }

    async delete(id: string, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const sop = await this.findOne(id, companyId);
        if (sop.createdById !== currentUserId && currentUserRole === UserRole.USER) throw new ForbiddenException('You can only delete your own SOPs');
        await this.prisma.sop.delete({ where: { id } });
        return { message: 'SOP deleted successfully' };
    }

    async getStats(companyId: string) {
        const [total, approved, pending, rejected, byType] = await Promise.all([this.prisma.sop.count({ where: { companyId } }), this.prisma.sop.count({ where: { companyId, status: SopStatus.APPROVED } }), this.prisma.sop.count({ where: { companyId, status: SopStatus.PENDING_APPROVAL } }), this.prisma.sop.count({ where: { companyId, status: SopStatus.REJECTED } }), this.prisma.sop.groupBy({ by: ['type'], where: { companyId }, _count: true })]);
        return { total, approved, pending, rejected, byType: byType.map((t) => ({ type: t.type, count: t._count })) };
    }
}