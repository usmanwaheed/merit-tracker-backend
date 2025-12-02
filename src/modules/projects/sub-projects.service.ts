// src/modules/projects/sub-projects.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubProject, SubProjectStatus } from '../../entities/sub-project.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { CreateSubProjectDto, UpdateSubProjectDto } from './dto/sub-projects.dto';

@Injectable()
export class SubProjectsService {
    constructor(
        @InjectRepository(SubProject)
        private subProjectsRepository: Repository<SubProject>,
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
    ) { }

    async create(projectId: string, createDto: CreateSubProjectDto, currentUser: User): Promise<SubProject> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId: currentUser.companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const subProject = this.subProjectsRepository.create({
            ...createDto,
            projectId,
            createdById: currentUser.id,
        });

        return this.subProjectsRepository.save(subProject);
    }

    async findAll(projectId: string, companyId: string): Promise<SubProject[]> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.subProjectsRepository.find({
            where: { projectId },
            relations: ['assignedTo', 'createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, projectId: string, companyId: string): Promise<SubProject> {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId, companyId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const subProject = await this.subProjectsRepository.findOne({
            where: { id, projectId },
            relations: ['assignedTo', 'createdBy', 'timeTrackings'],
        });

        if (!subProject) {
            throw new NotFoundException('SubProject not found');
        }

        return subProject;
    }

    async update(id: string, projectId: string, updateDto: UpdateSubProjectDto, currentUser: User): Promise<SubProject> {
        const subProject = await this.findOne(id, projectId, currentUser.companyId);

        Object.assign(subProject, updateDto);
        return this.subProjectsRepository.save(subProject);
    }

    async delete(id: string, projectId: string, currentUser: User): Promise<void> {
        const subProject = await this.findOne(id, projectId, currentUser.companyId);
        await this.subProjectsRepository.remove(subProject);
    }
}
