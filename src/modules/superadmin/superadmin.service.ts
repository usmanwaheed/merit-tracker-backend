import { Injectable, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SuperadminLoginDto, SuperadminRegisterDto } from './dto/superadmin-auth.dto';

@Injectable()
export class SuperadminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    private get superAdminDelegate() {
        const candidate = (this.prisma as PrismaClient & { superAdmin?: unknown }).superAdmin as
            | Prisma.SuperAdminDelegate
            | undefined;

        if (
            candidate &&
            typeof candidate.findUnique === 'function' &&
            typeof candidate.create === 'function'
        ) {
            return candidate;
        }

        return null;
    }

    private async findSuperadminByEmail(email: string) {
        const superAdminModel = this.superAdminDelegate;
        if (superAdminModel && typeof superAdminModel.findUnique === 'function') {
            return superAdminModel.findUnique({ where: { email } });
        }

        const results = await this.prisma.$queryRaw<Array<{
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>>(Prisma.sql`
            SELECT *
            FROM "super_admins"
            WHERE "email" = ${email}
            LIMIT 1
        `);

        return results[0] ?? null;
    }

    private async findSuperadminById(id: string) {
        const superAdminModel = this.superAdminDelegate;
        if (superAdminModel && typeof superAdminModel.findUnique === 'function') {
            return superAdminModel.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    updatedAt: true,
                    isActive: true,
                },
            });
        }

        const results = await this.prisma.$queryRaw<Array<{
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
        }>>(Prisma.sql`
            SELECT "id", "email", "firstName", "lastName", "createdAt", "updatedAt", "isActive"
            FROM "super_admins"
            WHERE "id" = ${id}
            LIMIT 1
        `);

        return results[0] ?? null;
    }

    private async createSuperadmin(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const superAdminModel = this.superAdminDelegate;
        if (superAdminModel && typeof superAdminModel.create === 'function') {
            return superAdminModel.create({ data });
        }

        const results = await this.prisma.$queryRaw<Array<{
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }>>(Prisma.sql`
            INSERT INTO "super_admins" ("email", "password", "firstName", "lastName")
            VALUES (${data.email}, ${data.password}, ${data.firstName}, ${data.lastName})
            RETURNING "id", "email", "password", "firstName", "lastName", "isActive", "createdAt", "updatedAt"
        `);

        return results[0];
    }

    private async validateCredentials(email: string, password: string) {
        const superadmin = await this.findSuperadminByEmail(email);

        if (!superadmin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!superadmin.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        const isPasswordValid = await bcrypt.compare(password, superadmin.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _password, ...rest } = superadmin;
        return rest;
    }

    private buildToken(superadmin: { id: string; email: string }) {
        const payload = {
            sub: superadmin.id,
            email: superadmin.email,
            role: 'SUPERADMIN',
        };

        return this.jwtService.sign(payload);
    }

    async login(loginDto: SuperadminLoginDto) {
        const superadmin = await this.validateCredentials(loginDto.email, loginDto.password);

        return {
            access_token: this.buildToken(superadmin),
            superadmin: {
                id: superadmin.id,
                email: superadmin.email,
                firstName: superadmin.firstName,
                lastName: superadmin.lastName,
            },
        };
    }

    async register(registerDto: SuperadminRegisterDto) {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        const existing = await this.findSuperadminByEmail(registerDto.email);
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const newSuperadmin = await this.createSuperadmin({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
        });

        const { password, ...rest } = newSuperadmin;

        return {
            access_token: this.buildToken(rest),
            superadmin: {
                id: rest.id,
                email: rest.email,
                firstName: rest.firstName,
                lastName: rest.lastName,
            },
        };
    }

    async getProfile(superadminId: string) {
        const superadmin = await this.findSuperadminById(superadminId);

        if (!superadmin) {
            throw new UnauthorizedException('Superadmin not found');
        }

        return superadmin;
    }
}