// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/users.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(companyId: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { companyId },
            include: { department: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    // src/modules/users/users.service.ts - Update findOne method to be more specific
    async findOne(id: string, companyId: string): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                companyId,
                isActive: true // Add this to only find active users
            },
            include: {
                department: true,
                company: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { company: true },
        });
    }

    // src/modules/users/users.service.ts - Updated update method
    async update(id: string, updateDto: UpdateUserDto, currentUser: User): Promise<User> {
        const user = await this.findOne(id, currentUser.companyId);

        // Only allow updating own profile or if user is admin
        if (user.id !== currentUser.id && currentUser.role === UserRole.USER) {
            throw new ForbiddenException('You can only update your own profile');
        }

        // Validate department exists if departmentId is provided
        if (updateDto.departmentId) {
            const department = await this.prisma.department.findFirst({
                where: {
                    id: updateDto.departmentId,
                    companyId: currentUser.companyId
                },
            });

            if (!department) {
                throw new NotFoundException('Department not found in your company');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: updateDto,
            include: { department: true, company: true },
        });
    }

    async updateRole(id: string, updateDto: UpdateUserRoleDto, currentUser: User): Promise<User> {
        // Only company admin or QC admin can change roles
        if (currentUser.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to change roles');
        }

        const user = await this.findOne(id, currentUser.companyId);

        // Cannot change company admin role
        if (user.role === UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Cannot change company admin role');
        }

        return this.prisma.user.update({
            where: { id },
            data: { role: updateDto.role },
            include: { department: true, company: true },
        });
    }

    async deactivate(id: string, currentUser: User): Promise<User> {
        // Only company admin can deactivate users
        if (currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can deactivate users');
        }

        const user = await this.findOne(id, currentUser.companyId);

        // Cannot deactivate self
        if (user.id === currentUser.id) {
            throw new ForbiddenException('Cannot deactivate your own account');
        }

        // Cannot deactivate company admin
        if (user.role === UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Cannot deactivate company admin');
        }

        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            include: { department: true, company: true },
        });
    }

    async activate(id: string, currentUser: User): Promise<User> {
        if (currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can activate users');
        }

        const user = await this.findOne(id, currentUser.companyId);

        return this.prisma.user.update({
            where: { id },
            data: { isActive: true },
            include: { department: true, company: true },
        });
    }

    async getLeaderboard(companyId: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { companyId, isActive: true },
            orderBy: { points: 'desc' },
            take: 50,
        });
    }
}
