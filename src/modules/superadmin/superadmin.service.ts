import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  SuperadminLoginDto,
  SuperadminRegisterDto,
} from './dto/superadmin-auth.dto';

@Injectable()
export class SuperadminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    console.log(Object.keys(this.prisma));
  }

  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<
    Omit<
      {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      },
      'password'
    >
  > {
    const superadmin = await this.prisma.superAdmin.findUnique({
      where: { email },
    });

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

    const { password: _, ...rest } = superadmin;
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
    const superadmin = await this.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    return {
      access_token: this.buildToken(superadmin),
      admin: {
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

    const existing = await this.prisma.superAdmin.findUnique({
      where: { email: registerDto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newSuperadmin = await this.prisma.superAdmin.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
    });

    const { password, ...rest } = newSuperadmin;

    return {
      access_token: this.buildToken(rest),
      admin: {
        id: rest.id,
        email: rest.email,
        firstName: rest.firstName,
        lastName: rest.lastName,
      },
    };
  }

  async getProfile(superadminId: string) {
    const superadmin = await this.prisma.superAdmin.findUnique({
      where: { id: superadminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    }) as { id: string; email: string; firstName: string; lastName: string; createdAt: Date; updatedAt: Date; isActive: boolean } | null;

    if (!superadmin) {
      throw new UnauthorizedException('Superadmin not found');
    }

    return superadmin;
  }
}
