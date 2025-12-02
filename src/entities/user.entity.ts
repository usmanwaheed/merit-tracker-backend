// src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { ProjectMember } from './project-member.entity';
import { TimeTracking } from './time-tracking.entity';
import { Sop } from './sop.entity';
import { Notification } from './notification.entity';

export enum UserRole {
    USER = 'USER',
    QC_ADMIN = 'QC_ADMIN',
    COMPANY_ADMIN = 'COMPANY_ADMIN'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Company, company => company.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    companyId: string;

    @ManyToOne(() => Department, department => department.users, { nullable: true })
    @JoinColumn({ name: 'departmentId' })
    department: Department;

    @Column({ nullable: true })
    departmentId: string;

    @Column({ type: 'date', nullable: true })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ type: 'int', default: 0 })
    points: number;

    @OneToMany(() => ProjectMember, projectMember => projectMember.user)
    projectMemberships: ProjectMember[];

    @OneToMany(() => TimeTracking, timeTracking => timeTracking.user)
    timeTrackings: TimeTracking[];

    @OneToMany(() => Sop, sop => sop.createdBy)
    sopsCreated: Sop[];

    @OneToMany(() => Notification, notification => notification.user)
    notifications: Notification[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}