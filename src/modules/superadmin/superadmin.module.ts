import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { SuperadminJwtStrategy } from './strategies/superadmin-jwt.strategy';
import { SuperadminCompaniesController } from './superadmin-companies.controller';
import { SuperadminCompaniesService } from './superadmin-companies.service';
import { SuperadminPlansController } from './superadmin-plans.controller';
import { SuperadminPlansService } from './superadmin-plans.service';
import { SuperadminUsersController } from './superadmin-users.controller';
import { SuperadminUsersService } from './superadmin-users.service';
import { SuperadminSubscriptionsController } from './superadmin-subscriptions.controller';
import { SuperadminSubscriptionsService } from './superadmin-subscriptions.service';
import { SuperadminTransactionsController } from './superadmin-transactions.controller';
import { SuperadminTransactionsService } from './superadmin-transactions.service';
import { SuperadminAnalyticsController } from './superadmin-analytics.controller';
import { SuperadminAnalyticsService } from './superadmin-analytics.service';
import { SuperadminSettingsController } from './superadmin-settings.controller';
import { SuperadminSettingsService } from './superadmin-settings.service';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('SUPERADMIN_JWT_SECRET') || configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('SUPERADMIN_JWT_EXPIRATION') || configService.get('JWT_EXPIRATION') || '7d',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [
        SuperadminController,
        SuperadminCompaniesController,
        SuperadminPlansController,
        SuperadminUsersController,
        SuperadminSubscriptionsController,
        SuperadminTransactionsController,
        SuperadminAnalyticsController,
        SuperadminSettingsController,
    ],
    providers: [
        SuperadminService,
        SuperadminCompaniesService,
        SuperadminPlansService,
        SuperadminUsersService,
        SuperadminSubscriptionsService,
        SuperadminTransactionsService,
        SuperadminAnalyticsService,
        SuperadminSettingsService,
        SuperadminJwtStrategy,
    ],
})
export class SuperadminModule { }