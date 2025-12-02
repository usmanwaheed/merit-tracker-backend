// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/users.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findAll(companyId: string): Promise<User[]> {
        return this.usersRepository.find({
            where: { companyId },
            relations: ['department'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, companyId: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id, companyId },
            relations: ['department', 'company'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['company'],
        });
    }

    async update(id: string, updateDto: UpdateUserDto, currentUser: User): Promise<User> {
        const user = await this.findOne(id, currentUser.companyId);

        // Only allow updating own profile or if user is admin
        if (user.id !== currentUser.id && currentUser.role === UserRole.USER) {
            throw new ForbiddenException('You can only update your own profile');
        }

        Object.assign(user, updateDto);
        return this.usersRepository.save(user);
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

        user.role = updateDto.role;
        return this.usersRepository.save(user);
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

        user.isActive = false;
        return this.usersRepository.save(user);
    }

    async activate(id: string, currentUser: User): Promise<User> {
        if (currentUser.role !== UserRole.COMPANY_ADMIN) {
            throw new ForbiddenException('Only company admin can activate users');
        }

        const user = await this.findOne(id, currentUser.companyId);
        user.isActive = true;
        return this.usersRepository.save(user);
    }

    async getLeaderboard(companyId: string): Promise<User[]> {
        return this.usersRepository.find({
            where: { companyId, isActive: true },
            order: { points: 'DESC' },
            take: 50,
        });
    }
}