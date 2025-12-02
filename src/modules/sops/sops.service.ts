// src/modules/sops/sops.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sop, SopStatus, SopType } from '../../entities/sop.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateSopDto, UpdateSopDto, ApproveSopDto, RejectSopDto } from './dto/sops.dto';

@Injectable()
export class SopsService {
    constructor(
        @InjectRepository(Sop)
        private sopsRepository: Repository<Sop>,
    ) { }

    async create(createDto: CreateSopDto, currentUser: User): Promise<Sop> {
        const sop = this.sopsRepository.create({
            ...createDto,
            companyId: currentUser.companyId,
            createdById: currentUser.id,
            status: SopStatus.PENDING_APPROVAL,
        });

        return this.sopsRepository.save(sop);
    }

    async findAll(companyId: string, status?: SopStatus, type?: SopType): Promise<Sop[]> {
        const where: any = { companyId };

        if (status) {
            where.status = status;
        }

        if (type) {
            where.type = type;
        }

        return this.sopsRepository.find({
            where,
            relations: ['createdBy', 'approvedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, companyId: string): Promise<Sop> {
        const sop = await this.sopsRepository.findOne({
            where: { id, companyId },
            relations: ['createdBy', 'approvedBy'],
        });

        if (!sop) {
            throw new NotFoundException('SOP not found');
        }

        // Increment view count
        sop.viewCount += 1;
        await this.sopsRepository.save(sop);

        return sop;
    }

    async update(id: string, updateDto: UpdateSopDto, currentUser: User): Promise<Sop> {
        const sop = await this.findOne(id, currentUser.companyId);

        // Only creator can update pending SOPs
        if (sop.createdById !== currentUser.id && currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('You can only update your own SOPs');
        }

        // Cannot update approved SOPs unless admin
        if (sop.status === SopStatus.APPROVED && currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Cannot update approved SOPs');
        }

        Object.assign(sop, updateDto);
        return this.sopsRepository.save(sop);
    }

    async approve(id: string, approveDto: ApproveSopDto, currentUser: User): Promise<Sop> {
        // Only QC Admin or Company Admin can approve
        if (currentUser.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to approve SOPs');
        }

        const sop = await this.findOne(id, currentUser.companyId);

        if (sop.status !== SopStatus.PENDING_APPROVAL) {
            throw new ForbiddenException('SOP is not pending approval');
        }

        sop.status = SopStatus.APPROVED;
        sop.approvedById = currentUser.id;
        sop.approvedAt = new Date();

        return this.sopsRepository.save(sop);
    }

    async reject(id: string, rejectDto: RejectSopDto, currentUser: User): Promise<Sop> {
        // Only QC Admin or Company Admin can reject
        if (currentUser.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to reject SOPs');
        }

        const sop = await this.findOne(id, currentUser.companyId);

        if (sop.status !== SopStatus.PENDING_APPROVAL) {
            throw new ForbiddenException('SOP is not pending approval');
        }

        sop.status = SopStatus.REJECTED;
        sop.rejectionReason = rejectDto.reason;

        return this.sopsRepository.save(sop);
    }

    async delete(id: string, currentUser: User): Promise<void> {
        const sop = await this.findOne(id, currentUser.companyId);

        // Only creator or admin can delete
        if (sop.createdById !== currentUser.id && currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('You can only delete your own SOPs');
        }

        await this.sopsRepository.remove(sop);
    }

    async getPendingApprovals(companyId: string): Promise<Sop[]> {
        return this.sopsRepository.find({
            where: { companyId, status: SopStatus.PENDING_APPROVAL },
            relations: ['createdBy'],
            order: { createdAt: 'ASC' },
        });
    }

    async getAnalytics(companyId: string) {
        const sops = await this.sopsRepository.find({ where: { companyId } });

        const byType = sops.reduce((acc, sop) => {
            acc[sop.type] = (acc[sop.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const byStatus = sops.reduce((acc, sop) => {
            acc[sop.status] = (acc[sop.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalViews = sops.reduce((sum, sop) => sum + sop.viewCount, 0);
        const avgViews = sops.length > 0 ? totalViews / sops.length : 0;

        return {
            total: sops.length,
            byType,
            byStatus,
            totalViews,
            avgViews: Math.round(avgViews * 100) / 100,
            pendingApprovals: byStatus[SopStatus.PENDING_APPROVAL] || 0,
        };
    }
}