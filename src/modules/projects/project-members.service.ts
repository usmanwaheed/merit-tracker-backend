// src/modules/projects/project-members.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember, ProjectMemberRole } from '../../entities/project-member.entity';
import { Project } from '../../entities/project.entity';
import { User, UserRole } from '../../entities/user.entity';
import { AddMemberDto, UpdateMemberRoleDto } from './dto/project-members.dto';

@Injectable()
export class ProjectMembersService {
    constructor(
        @InjectRepository(ProjectMember)
        private projectMembersRepository: Repository<ProjectMember>,
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async addMember(projectId: string, addDto: AddMemberDto, currentUser: User): Promise<ProjectMember> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId: currentUser.companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user has permission
        if (currentUser.role === UserRole.USER && project.projectLeadId !== currentUser.id) {
            throw new ForbiddenException('Insufficient permissions to add members');
        }

        // Verify user exists and belongs to same company
        const user = await this.usersRepository.findOne({
            where: { id: addDto.userId, companyId: currentUser.companyId },
        });

        if (!user) {
            throw new BadRequestException('User not found or not in same company');
        }

        // Check if already a member
        const existingMember = await this.projectMembersRepository.findOne({
            where: { projectId, userId: addDto.userId },
        });

        if (existingMember) {
            throw new BadRequestException('User is already a member of this project');
        }

        const member = this.projectMembersRepository.create({
            projectId,
            userId: addDto.userId,
            role: addDto.role || ProjectMemberRole.MEMBER,
        });

        return this.projectMembersRepository.save(member);
    }

    async getMembers(projectId: string, companyId: string): Promise<ProjectMember[]> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.projectMembersRepository.find({
            where: { projectId },
            relations: ['user', 'user.department'],
            order: { joinedAt: 'DESC' },
        });
    }

    async updateMemberRole(
        projectId: string,
        memberId: string,
        updateDto: UpdateMemberRoleDto,
        currentUser: User,
    ): Promise<ProjectMember> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId: currentUser.companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Only QC admins and project leads can change roles
        if (
            currentUser.role === UserRole.USER &&
            project.projectLeadId !== currentUser.id
        ) {
            throw new ForbiddenException('Insufficient permissions to update member role');
        }

        const member = await this.projectMembersRepository.findOne({
            where: { id: memberId, projectId },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        member.role = updateDto.role;
        return this.projectMembersRepository.save(member);
    }

    async removeMember(projectId: string, memberId: string, currentUser: User): Promise<void> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId: currentUser.companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (currentUser.role === UserRole.USER && project.projectLeadId !== currentUser.id) {
            throw new ForbiddenException('Insufficient permissions to remove members');
        }

        const member = await this.projectMembersRepository.findOne({
            where: { id: memberId, projectId },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        await this.projectMembersRepository.remove(member);
    }

    async getLeaderboard(projectId: string, companyId: string): Promise<ProjectMember[]> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.projectMembersRepository.find({
            where: { projectId },
            relations: ['user'],
            order: { pointsEarned: 'DESC' },
        });
    }
}