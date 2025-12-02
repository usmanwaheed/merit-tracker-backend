// src/entities/notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
    PROJECT_ASSIGNMENT = 'PROJECT_ASSIGNMENT',
    TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
    SOP_APPROVAL = 'SOP_APPROVAL',
    SOP_REJECTION = 'SOP_REJECTION',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    DEPARTMENT_ASSIGNMENT = 'DEPARTMENT_ASSIGNMENT',
    ROLE_CHANGE = 'ROLE_CHANGE',
    SYSTEM = 'SYSTEM'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'json', nullable: true })
    metadata: any; // Additional data like projectId, sopId, etc.

    @Column({ default: false })
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}