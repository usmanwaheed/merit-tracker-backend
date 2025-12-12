// src/modules/departments/departments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateDepartmentDto, UpdateDepartmentDto, AssignUsersDto } from './dto/departments.dto';

@Injectable()
export class DepartmentsService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateDepartmentDto, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to create department');
        }

        return this.prisma.department.create({
            data: {
                ...createDto,
                companyId,
            },
            include: {
                lead: true,
                users: true,
            },
        });
    }

    async findAll(companyId: string) {
        return this.prisma.department.findMany({
            where: { companyId },
            include: {
                lead: true,
                users: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, companyId: string) {
        const department = await this.prisma.department.findFirst({
            where: { id, companyId },
            include: {
                lead: true,
                users: true,
            },
        });

        if (!department) {
            throw new NotFoundException('Department not found');
        }

        return department;
    }

    async update(id: string, updateDto: UpdateDepartmentDto, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to update department');
        }

        await this.findOne(id, companyId);

        return this.prisma.department.update({
            where: { id },
            data: updateDto,
            include: {
                lead: true,
                users: true,
            },
        });
    }

    async assignUsers(id: string, assignDto: AssignUsersDto, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to assign users');
        }

        const department = await this.findOne(id, companyId);

        await this.prisma.user.updateMany({
            where: {
                id: { in: assignDto.userIds },
                companyId,
            },
            data: { departmentId: department.id },
        });

        return this.findOne(id, companyId);
    }

    async delete(id: string, currentUserRole: UserRole, companyId: string) {
        if (currentUserRole !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can delete departments');
        }

        const department = await this.findOne(id, companyId);

        await this.prisma.user.updateMany({
            where: { departmentId: department.id },
            data: { departmentId: null },
        });

        await this.prisma.department.delete({
            where: { id },
        });
    }
}