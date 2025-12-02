
// src/modules/time-tracking/screenshot.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeTracking } from '../../entities/time-tracking.entity';

@Injectable()
export class ScreenshotService {
    constructor(
        @InjectRepository(TimeTracking)
        private timeTrackingRepository: Repository<TimeTracking>,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async scheduleScreenshotReminder() {
        // This would typically trigger notifications to active tracking sessions
        // to capture screenshots. In a real implementation, this would integrate
        // with a notification service or WebSocket to alert clients
        const activeTrackings = await this.timeTrackingRepository.find({
            where: { isActive: true },
            relations: ['user', 'subProject', 'subProject.project'],
        });

        console.log(`${activeTrackings.length} active tracking sessions need screenshot capture`);

        // Here you would typically:
        // 1. Send WebSocket event to connected clients
        // 2. Or trigger a notification
        // 3. Client captures screenshot and uploads
    }
}

