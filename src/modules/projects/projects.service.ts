// src/modules/projects/projects.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, ProjectMemberRole } from '@prisma/client';
import { CreateProjectDto, UpdateProjectDto, AddProjectMembersDto, RemoveProjectMembersDto, UpdateMemberRoleDto, ProjectQueryDto } from './dto/projects.dto';

@Injectable()
export class ProjectsService {
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

    async create(createDto: CreateProjectDto, currentUserRole: UserRole, currentUserId: string, companyId: string) {
        if (currentUserRole === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to create projects');
        }

        const { memberIds, startDate, endDate, ...restProjectData } = createDto;

        // Prepare project data with proper date conversion
        const projectData = {
            ...restProjectData,
            companyId,
            budget: restProjectData.budget || null,
            startDate: this.toDateTime(startDate),
            endDate: this.toDateTime(endDate),
        };

        // Use transaction and return the final result from within it
        const result = await this.prisma.$transaction(async (prisma) => {
            // Create the project
            const project = await prisma.project.create({
                data: projectData,
            });

            // Add members if provided
            if (memberIds?.length) {
                const users = await prisma.user.findMany({
                    where: { id: { in: memberIds }, companyId }
                });
                if (users.length !== memberIds.length) {
                    throw new BadRequestException('Some users not found');
                }
                await prisma.projectMember.createMany({
                    data: memberIds.map((userId) => ({
                        projectId: project.id,
                        userId,
                        role: ProjectMemberRole.MEMBER
                    })),
                    skipDuplicates: true,
                });
            }

            // Add project lead as a member with LEAD role
            if (restProjectData.projectLeadId) {
                await prisma.projectMember.upsert({
                    where: {
                        projectId_userId: {
                            projectId: project.id,
                            userId: restProjectData.projectLeadId
                        }
                    },
                    create: {
                        projectId: project.id,
                        userId: restProjectData.projectLeadId,
                        role: ProjectMemberRole.LEAD
                    },
                    update: { role: ProjectMemberRole.LEAD },
                });
            }

            // Fetch the complete project data WITHIN the transaction
            const completeProject = await prisma.project.findFirst({
                where: { id: project.id, companyId },
                include: {
                    projectLead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatar: true,
                            role: true
                        }
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    avatar: true,
                                    role: true,
                                    points: true
                                }
                            }
                        },
                        orderBy: { pointsEarned: 'desc' }
                    },
                    subProjects: {
                        include: {
                            assignedTo: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true
                                }
                            },
                            createdBy: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: {
                            members: true,
                            subProjects: true,
                            chatRooms: true
                        }
                    },
                },
            });

            return completeProject;
        });

        if (!result) {
            throw new BadRequestException('Failed to create project');
        }

        return result;
    }

    async findAll(companyId: string, query?: ProjectQueryDto) {
        const where: any = { companyId };
        if (query?.status) where.status = query.status;
        if (query?.search) where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
        ];

        return this.prisma.project.findMany({
            where,
            include: {
                projectLead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                },
                _count: { select: { members: true, subProjects: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, companyId: string) {
        const project = await this.prisma.project.findFirst({
            where: { id, companyId },
            include: {
                projectLead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                        role: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true,
                                role: true,
                                points: true
                            }
                        }
                    },
                    orderBy: { pointsEarned: 'desc' }
                },
                subProjects: {
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        },
                        createdBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        members: true,
                        subProjects: true,
                        chatRooms: true
                    }
                },
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async findUserProjects(userId: string, companyId: string) {
        return this.prisma.project.findMany({
            where: {
                companyId,
                OR: [
                    { projectLeadId: userId },
                    { members: { some: { userId } } }
                ]
            },
            include: {
                projectLead: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                _count: { select: { members: true, subProjects: true } }
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async update(id: string, updateDto: UpdateProjectDto, currentUserRole: UserRole, currentUserId: string, companyId: string) {
        const project = await this.findOne(id, companyId);
        if (!this.canManageProject(currentUserRole, currentUserId, project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        const { startDate, endDate, ...restUpdateData } = updateDto;

        // Prepare update data with proper date conversion
        const updateData: any = { ...restUpdateData };

        if (updateDto.budget !== undefined) {
            updateData.budget = updateDto.budget;
        }

        if (startDate !== undefined) {
            updateData.startDate = startDate ? this.toDateTime(startDate) : null;
        }

        if (endDate !== undefined) {
            updateData.endDate = endDate ? this.toDateTime(endDate) : null;
        }

        await this.prisma.project.update({
            where: { id },
            data: updateData,
        });

        // Return the updated project with all relations
        return this.findOne(id, companyId);
    }

    async delete(id: string, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can delete projects');
        }
        await this.findOne(id, companyId);
        await this.prisma.project.delete({ where: { id } });
        return { message: 'Project deleted successfully' };
    }

    async addMembers(id: string, dto: AddProjectMembersDto, currentUserRole: UserRole, currentUserId: string, companyId: string) {
        const project = await this.findOne(id, companyId);
        if (!this.canManageProject(currentUserRole, currentUserId, project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        const users = await this.prisma.user.findMany({
            where: { id: { in: dto.userIds }, companyId }
        });
        if (users.length !== dto.userIds.length) {
            throw new BadRequestException('Some users not found');
        }

        await this.prisma.projectMember.createMany({
            data: dto.userIds.map((userId) => ({
                projectId: id,
                userId,
                role: ProjectMemberRole.MEMBER
            })),
            skipDuplicates: true
        });

        return this.findOne(id, companyId);
    }

    async removeMembers(id: string, dto: RemoveProjectMembersDto, currentUserRole: UserRole, currentUserId: string, companyId: string) {
        const project = await this.findOne(id, companyId);
        if (!this.canManageProject(currentUserRole, currentUserId, project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        if (project.projectLeadId && dto.userIds.includes(project.projectLeadId)) {
            throw new BadRequestException('Cannot remove project lead');
        }

        await this.prisma.projectMember.deleteMany({
            where: { projectId: id, userId: { in: dto.userIds } }
        });

        return this.findOne(id, companyId);
    }

    async updateMemberRole(id: string, dto: UpdateMemberRoleDto, currentUserRole: UserRole, currentUserId: string, companyId: string) {
        const project = await this.findOne(id, companyId);
        if (!this.canManageProject(currentUserRole, currentUserId, project)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId: id, userId: dto.userId } }
        });
        if (!member) {
            throw new NotFoundException('Member not found');
        }

        if (dto.role === ProjectMemberRole.LEAD) {
            // If setting a new lead, demote the current lead
            if (project.projectLeadId) {
                await this.prisma.projectMember.updateMany({
                    where: { projectId: id, userId: project.projectLeadId },
                    data: { role: ProjectMemberRole.MEMBER }
                });
            }
            // Update project's projectLeadId
            await this.prisma.project.update({
                where: { id },
                data: { projectLeadId: dto.userId }
            });
        }

        await this.prisma.projectMember.update({
            where: { projectId_userId: { projectId: id, userId: dto.userId } },
            data: { role: dto.role }
        });

        return this.findOne(id, companyId);
    }

    async getProjectLeaderboard(id: string, companyId: string) {
        await this.findOne(id, companyId);
        return this.prisma.projectMember.findMany({
            where: { projectId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                        points: true
                    }
                }
            },
            orderBy: { pointsEarned: 'desc' }
        });
    }

    async getProjectStats(id: string, companyId: string) {
        await this.findOne(id, companyId);

        const [totalMembers, totalSubProjects, completedSubProjects, inProgressSubProjects, totalTimeTracked] = await Promise.all([
            this.prisma.projectMember.count({ where: { projectId: id } }),
            this.prisma.subProject.count({ where: { projectId: id } }),
            this.prisma.subProject.count({ where: { projectId: id, status: 'COMPLETED' } }),
            this.prisma.subProject.count({ where: { projectId: id, status: 'IN_PROGRESS' } }),
            this.prisma.timeTracking.aggregate({
                where: { subProject: { projectId: id } },
                _sum: { durationMinutes: true }
            }),
        ]);

        const todoSubProjects = totalSubProjects - completedSubProjects - inProgressSubProjects;
        const completionPercentage = totalSubProjects > 0
            ? Math.round((completedSubProjects / totalSubProjects) * 100)
            : 0;
        const totalTimeTrackedMinutes = totalTimeTracked._sum.durationMinutes || 0;
        const totalTimeTrackedHours = Math.round(totalTimeTrackedMinutes / 60 * 100) / 100;

        return {
            projectId: id,
            totalMembers,
            totalSubProjects,
            completedSubProjects,
            inProgressSubProjects,
            todoSubProjects,
            completionPercentage,
            totalTimeTrackedMinutes,
            totalTimeTrackedHours
        };
    }

    private canManageProject(userRole: UserRole, userId: string, project: any): boolean {
        if (userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.QC_ADMIN) return true;
        if (project.projectLeadId === userId) return true;
        const member = project.members?.find((m: any) => m.userId === userId);
        return member && member.role === ProjectMemberRole.QC_ADMIN;
    }
}