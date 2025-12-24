// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SubProjectsModule } from './modules/sub-projects/sub-projects.module';
import { TimeTrackingModule } from './modules/time-tracking/time-tracking.module';
import { SopsModule } from './modules/sops/sops.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { SubscriptionGuard } from './modules/auth/guards';
import { SuperadminModule } from './modules/superadmin/superadmin.module';
// import { SubscriptionGuard } from './common/guards/subscription.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    DepartmentsModule,
    ProjectsModule,
    SubProjectsModule,
    TimeTrackingModule,
    SopsModule,
    ChatModule,
    NotificationsModule,
    ActivityLogsModule,
    SuperadminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule {}
