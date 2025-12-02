// src/entities/time-tracking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { SubProject } from './sub-project.entity';

@Entity('time_trackings')
export class TimeTracking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.timeTrackings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => SubProject, subProject => subProject.timeTrackings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subProjectId' })
    subProject: SubProject;

    @Column()
    subProjectId: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'int', default: 0 })
    durationMinutes: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column('simple-array', { nullable: true })
    screenshots: string[]; // URLs to screenshots

    @Column({ default: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
