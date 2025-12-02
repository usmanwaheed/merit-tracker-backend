// src/entities/project.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';
import { ProjectMember } from './project-member.entity';
import { SubProject } from './sub-project.entity';
import { ChatRoom } from './chat-room.entity';

export enum ProjectStatus {
    PLANNING = 'PLANNING',
    IN_PROGRESS = 'IN_PROGRESS',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    budget: number;

    @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNING })
    status: ProjectStatus;

    @ManyToOne(() => Company, company => company.projects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    companyId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'projectLeadId' })
    projectLead: User;

    @Column({ nullable: true })
    projectLeadId: string;

    @Column({ type: 'date', nullable: true })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ default: false })
    screenMonitoringEnabled: boolean;

    @OneToMany(() => ProjectMember, projectMember => projectMember.project)
    members: ProjectMember[];

    @OneToMany(() => SubProject, subProject => subProject.project)
    subProjects: SubProject[];

    @OneToMany(() => ChatRoom, chatRoom => chatRoom.project)
    chatRooms: ChatRoom[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}