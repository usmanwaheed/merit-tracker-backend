// src/entities/chat-room.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';
import { ChatRoomMember } from './chat-room-member.entity';

@Entity('chat_rooms')
export class ChatRoom {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Project, project => project.chatRooms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column()
    projectId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column()
    createdById: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => ChatMessage, message => message.chatRoom)
    messages: ChatMessage[];

    @OneToMany(() => ChatRoomMember, member => member.chatRoom)
    members: ChatRoomMember[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}