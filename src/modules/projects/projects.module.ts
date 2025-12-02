// src/modules/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { SubProjectsController } from './sub-projects.controller';
import { SubProjectsService } from './sub-projects.service';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';
import { Project } from '../../entities/project.entity';
import { ProjectMember } from '../../entities/project-member.entity';
import { SubProject } from '../../entities/sub-project.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Project, ProjectMember, SubProject, User])],
    controllers: [ProjectsController, SubProjectsController, ProjectMembersController],
    providers: [ProjectsService, SubProjectsService, ProjectMembersService],
    exports: [ProjectsService, SubProjectsService],
})
export class ProjectsModule { }