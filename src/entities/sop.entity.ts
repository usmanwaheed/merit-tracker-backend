// src/entities/sop.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

export enum SopType {
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    PDF = 'PDF',
    LINK = 'LINK',
    IMAGE = 'IMAGE'
}

export enum SopStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('sops')
export class Sop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'enum', enum: SopType })
    type: SopType;

    @Column()
    fileUrl: string;

    @Column({ nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'int', nullable: true })
    duration: number; // For videos, in seconds

    @Column({ type: 'enum', enum: SopStatus, default: SopStatus.PENDING_APPROVAL })
    status: SopStatus;

    @ManyToOne(() => Company, company => company.sops, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    companyId: string;

    @ManyToOne(() => User, user => user.sopsCreated)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column()
    createdById: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approvedById' })
    approvedBy: User;

    @Column({ nullable: true })
    approvedById: string;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt: Date;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}