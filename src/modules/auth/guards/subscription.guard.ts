// src/common/guards/subscription.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import { SKIP_SUBSCRIPTION_CHECK } from '../decorators/skip-subscription.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(
        private prisma: PrismaService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION_CHECK, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (skipCheck) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.companyId) {
            return true;
        }

        const company = await this.prisma.company.findUnique({
            where: { id: user.companyId },
        });

        if (!company) {
            throw new ForbiddenException('Company not found');
        }

        if (!company.isActive) {
            throw new ForbiddenException('Company account is inactive. Please contact support.');
        }

        const now = new Date();

        switch (company.subscriptionStatus) {
            case SubscriptionStatus.TRIAL:
                if (company.trialEndsAt && company.trialEndsAt < now) {
                    throw new ForbiddenException(
                        'Your trial has expired. Please upgrade to continue using the service.'
                    );
                }
                break;

            case SubscriptionStatus.ACTIVE:
                if (company.subscriptionEndsAt && company.subscriptionEndsAt < now) {
                    await this.prisma.company.update({
                        where: { id: company.id },
                        data: { subscriptionStatus: SubscriptionStatus.EXPIRED },
                    });
                    throw new ForbiddenException(
                        'Your subscription has expired. Please renew to continue using the service.'
                    );
                }
                break;

            case SubscriptionStatus.EXPIRED:
            case SubscriptionStatus.CANCELLED:
                throw new ForbiddenException(
                    'Your subscription is not active. Please renew to continue using the service.'
                );
        }

        return true;
    }
}