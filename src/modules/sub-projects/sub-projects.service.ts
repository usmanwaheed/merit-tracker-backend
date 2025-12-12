// src/modules/sub-projects/sub-projects.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, ProjectMemberRole } from '@prisma/client';
import { CreateSubProjectDto, UpdateSubProjectDto, AssignSubProjectDto, SubProjectQueryDto } from './dto/sub-projects.dto';

@Injectable()
export class SubProjectsService {
    constructor(private prisma: PrismaService) { }

    // Helper function to convert date string to proper DateTime
    private toDateTime(dateString?: string): Date | undefined {
        if (!dateString) return undefined;
        // If it's already a full ISO string, parse it directly
        if (dateString.includes('T')) {
            return new Date(dateString);
        }
        // If it's just a date (YYYY-MM-DD), add time component
        return new Date(`${dateString}T00:00:00.000Z`);
    }

    async create(createDto: CreateSubProjectDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        // Verify the project exists and user has access
        const project = await this.prisma.project.findFirst({
            where: { id: createDto.projectId, companyId },
            include: { members: true }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user can create tasks (must be admin, project lead, or member)
        const canCreate = this.canManageProject(currentUserRole, currentUserId, project);
        if (!canCreate) {
            throw new ForbiddenException('Insufficient permissions to create tasks');
        }

        const { dueDate, ...restData } = createDto;

        return this.prisma.subProject.create({
            data: {
                ...restData,
                dueDate: this.toDateTime(dueDate),
                createdById: currentUserId,
            },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } }
            }
        });
    }

    async findAll(projectId: string, companyId: string, query?: SubProjectQueryDto) {
        // Verify project exists
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, companyId }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const where: any = { projectId };
        if (query?.status) where.status = query.status;
        if (query?.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query?.assignedToId) where.assignedToId = query.assignedToId;

        return this.prisma.subProject.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
                _count: { select: { timeTrackings: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, companyId: string) {
        const subProject = await this.prisma.subProject.findFirst({
            where: { id, project: { companyId } },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: {
                    select: { id: true, name: true, projectLeadId: true },
                    include: { members: true }
                },
                timeTrackings: {
                    include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
                    orderBy: { startTime: 'desc' },
                    take: 10
                },
                _count: { select: { timeTrackings: true } }
            }
        });

        if (!subProject) {
            throw new NotFoundException('Task not found');
        }

        return subProject;
    }

    async findUserSubProjects(userId: string, companyId: string) {
        return this.prisma.subProject.findMany({
            where: {
                assignedToId: userId,
                project: { companyId }
            },
            include: {
                project: { select: { id: true, name: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { timeTrackings: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: string, updateDto: UpdateSubProjectDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const subProject = await this.findOne(id, companyId);

        if (!this.canManageProject(currentUserRole, currentUserId, subProject.project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        const { dueDate, ...restData } = updateDto;

        const updateData: any = { ...restData };
        if (dueDate !== undefined) {
            updateData.dueDate = dueDate ? this.toDateTime(dueDate) : null;
        }

        return this.prisma.subProject.update({
            where: { id },
            data: updateData,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } }
            }
        });
    }

    async assign(id: string, dto: AssignSubProjectDto, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const subProject = await this.findOne(id, companyId);

        if (!this.canManageProject(currentUserRole, currentUserId, subProject.project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        // Verify the user to be assigned is a member of the project
        const isMember = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: subProject.projectId,
                    userId: dto.userId
                }
            }
        });

        const isProjectLead = subProject.project.projectLeadId === dto.userId;

        if (!isMember && !isProjectLead) {
            throw new BadRequestException('User must be a project member to be assigned');
        }

        return this.prisma.subProject.update({
            where: { id },
            data: { assignedToId: dto.userId },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } }
            }
        });
    }

    async unassign(id: string, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const subProject = await this.findOne(id, companyId);

        if (!this.canManageProject(currentUserRole, currentUserId, subProject.project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return this.prisma.subProject.update({
            where: { id },
            data: { assignedToId: null },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } }
            }
        });
    }

    async delete(id: string, currentUserId: string, currentUserRole: UserRole, companyId: string) {
        const subProject = await this.findOne(id, companyId);

        if (!this.canManageProject(currentUserRole, currentUserId, subProject.project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        await this.prisma.subProject.delete({ where: { id } });

        return { message: 'Task deleted successfully' };
    }

    private canManageProject(userRole: UserRole, userId: string, project: any): boolean {
        if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.QC_ADMIN) return true;
        if (project.projectLeadId === userId) return true;
        const member = project.members?.find((m: any) => m.userId === userId);
        return member && member.role === ProjectMemberRole.QC_ADMIN;
    }
}