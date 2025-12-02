
// src/modules/chat/chat.gateway.ts
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({ cors: true })
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        client.join(roomId);
        return { event: 'joinedRoom', data: roomId };
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
        client.leave(roomId);
        return { event: 'leftRoom', data: roomId };
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('sendMessage')
    handleMessage(@MessageBody() data: { roomId: string; message: any }) {
        this.server.to(data.roomId).emit('newMessage', data.message);
        return { event: 'messageSent', data: data.message };
    }
}
