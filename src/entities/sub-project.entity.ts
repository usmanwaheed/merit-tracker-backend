// src/entities/sub-project.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { TimeTracking } from './time-tracking.entity';

export enum SubProjectStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    COMPLETED = 'COMPLETED'
}

@Entity('sub_projects')
export class SubProject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Project, project => project.subProjects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column()
    projectId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User;

    @Column({ nullable: true })
    assignedToId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column()
    createdById: string;

    @Column({ type: 'enum', enum: SubProjectStatus, default: SubProjectStatus.TODO })
    status: SubProjectStatus;

    @Column({ type: 'int', default: 0 })
    pointsValue: number;

    @Column({ type: 'int', nullable: true })
    estimatedHours: number;

    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @OneToMany(() => TimeTracking, timeTracking => timeTracking.subProject)
    timeTrackings: TimeTracking[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
