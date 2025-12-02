// src/entities/department.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    tag: string; // e.g., 'Engineering', 'Design', 'Marketing'

    @ManyToOne(() => Company, company => company.departments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @Column()
    companyId: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'leadId' })
    lead: User;

    @Column({ nullable: true })
    leadId: string;

    @OneToMany(() => User, user => user.department)
    users: User[];

    @Column({ type: 'date', nullable: true })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
