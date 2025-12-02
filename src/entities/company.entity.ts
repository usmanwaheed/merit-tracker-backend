// src/entities/company.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Project } from './project.entity';
import { Sop } from './sop.entity';

export enum SubscriptionStatus {
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    companyCode: string; // Special ID for users to join

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    website: string;

    @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
    subscriptionStatus: SubscriptionStatus;

    @Column({ type: 'timestamp', nullable: true })
    trialEndsAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionEndsAt: Date;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => User, user => user.company)
    users: User[];

    @OneToMany(() => Department, department => department.company)
    departments: Department[];

    @OneToMany(() => Project, project => project.company)
    projects: Project[];

    @OneToMany(() => Sop, sop => sop.company)
    sops: Sop[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}