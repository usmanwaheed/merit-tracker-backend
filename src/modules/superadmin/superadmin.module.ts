import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { SuperadminJwtStrategy } from './strategies/superadmin-jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

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
    controllers: [SuperadminController],
    providers: [SuperadminService, SuperadminJwtStrategy, PrismaService],
})
export class SuperadminModule { }