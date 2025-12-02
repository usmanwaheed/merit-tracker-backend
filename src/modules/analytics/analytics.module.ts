
// src/modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../../entities/user.entity';
import { Project } from '../../entities/project.entity';
import { SubProject } from '../../entities/sub-project.entity';
import { TimeTracking } from '../../entities/time-tracking.entity';
import { Sop } from '../../entities/sop.entity';
import { Department } from '../../entities/department.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Project, SubProject, TimeTracking, Sop, Department])],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
