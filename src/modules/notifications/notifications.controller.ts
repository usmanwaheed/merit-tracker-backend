// src/modules/notifications/notifications.controller.ts
import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all notifications' })
    async findAll(@CurrentUser() user: User) {
        return this.notificationsService.findAll(user.id);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notifications count' })
    async getUnreadCount(@CurrentUser() user: User) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
        return this.notificationsService.markAsRead(id, user.id);
    }

    @Patch('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@CurrentUser() user: User) {
        await this.notificationsService.markAllAsRead(user.id);
        return { message: 'All notifications marked as read' };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    async delete(@Param('id') id: string, @CurrentUser() user: User) {
        await this.notificationsService.delete(id, user.id);
        return { message: 'Notification deleted' };
    }
}