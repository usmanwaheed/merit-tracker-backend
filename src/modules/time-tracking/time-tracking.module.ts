// src/modules/time-tracking/time-tracking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { ScreenshotService } from './screenshot.service';
import { TimeTracking } from '../../entities/time-tracking.entity';
import { SubProject } from '../../entities/sub-project.entity';
import { ProjectMember } from '../../entities/project-member.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TimeTracking, SubProject, ProjectMember])],
    controllers: [TimeTrackingController],
    providers: [TimeTrackingService, ScreenshotService],
    exports: [TimeTrackingService],
})
export class TimeTrackingModule { }