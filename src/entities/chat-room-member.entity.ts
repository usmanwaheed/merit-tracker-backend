// src/entities/chat-room-member.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from './user.entity';

@Entity('chat_room_members')
export class ChatRoomMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => ChatRoom, chatRoom => chatRoom.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatRoomId' })
    chatRoom: ChatRoom;

    @Column()
    chatRoomId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @Column({ default: false })
    isQcAdmin: boolean;

    @CreateDateColumn()
    joinedAt: Date;
}