// src/entities/project-member.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';

export enum ProjectMemberRole {
    MEMBER = 'MEMBER',
    QC_ADMIN = 'QC_ADMIN',
    LEAD = 'LEAD'
}

@Entity('project_members')
export class ProjectMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Project, project => project.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column()
    projectId: string;

    @ManyToOne(() => User, user => user.projectMemberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({ type: 'enum', enum: ProjectMemberRole, default: ProjectMemberRole.MEMBER })
    role: ProjectMemberRole;

    @Column({ type: 'int', default: 0 })
    pointsEarned: number;

    @CreateDateColumn()
    joinedAt: Date;
}
