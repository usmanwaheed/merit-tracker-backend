// src/entities/activity-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

export enum ActivityType {
    USER_LOGIN = 'USER_LOGIN',
    USER_LOGOUT = 'USER_LOGOUT',
    PROJECT_CREATED = 'PROJECT_CREATED',
    PROJECT_UPDATED = 'PROJECT_UPDATED',
    SOP_CREATED = 'SOP_CREATED',
    SOP_APPROVED = 'SOP_APPROVED',
    TIME_TRACKING_START = 'TIME_TRACKING_START',
    TIME_TRACKING_END = 'TIME_TRACKING_END',
    DEPARTMENT_CREATED = 'DEPARTMENT_CREATED',
    USER_ROLE_CHANGED = 'USER_ROLE_CHANGED'
}

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Company, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    companyId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;

    @Column({ type: 'enum', enum: ActivityType })
    activityType: ActivityType;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @Column({ nullable: true })
    ipAddress: string;

    @CreateDateColumn()
    createdAt: Date;
}
