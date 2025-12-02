// src/modules/projects/projects.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../entities/project.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
    ) { }

    async create(createDto: CreateProjectDto, currentUser: User): Promise<Project> {
        if (currentUser.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to create project');
        }

        const project = this.projectsRepository.create({
            ...createDto,
            companyId: currentUser.companyId,
        });

        return this.projectsRepository.save(project);
    }

    async findAll(companyId: string): Promise<Project[]> {
        return this.projectsRepository.find({
            where: { companyId },
            relations: ['projectLead', 'members', 'members.user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, companyId: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id, companyId },
            relations: ['projectLead', 'members', 'members.user', 'subProjects'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    async update(id: string, updateDto: UpdateProjectDto, currentUser: User): Promise<Project> {
        const project = await this.findOne(id, currentUser.companyId);

        // Check if user has permission (admin, QC admin, or project lead)
        if (
            currentUser.role === UserRole.USER &&
            project.projectLeadId !== currentUser.id
        ) {
            throw new ForbiddenException('Insufficient permissions to update project');
        }

        Object.assign(project, updateDto);
        return this.projectsRepository.save(project);
    }

    async delete(id: string, currentUser: User): Promise<void> {
        if (currentUser.role === UserRole.USER) {
            throw new ForbiddenException('Insufficient permissions to delete project');
        }

        const project = await this.findOne(id, currentUser.companyId);
        await this.projectsRepository.remove(project);
    }

    async getProjectStats(id: string, companyId: string) {
        const project = await this.findOne(id, companyId);

        return {
            totalMembers: project.members?.length || 0,
            totalSubProjects: project.subProjects?.length || 0,
            completedSubProjects: project.subProjects?.filter(sp => sp.status === 'COMPLETED').length || 0,
            budget: project.budget,
            status: project.status,
        };
    }
}