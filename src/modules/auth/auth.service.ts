// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { Company, SubscriptionStatus } from '../../entities/company.entity';
import { RegisterCompanyDto, RegisterUserDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Company)
        private companiesRepository: Repository<Company>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['company'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        if (!user.company.isActive) {
            throw new UnauthorizedException('Company account is inactive');
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }

    async registerCompany(registerDto: RegisterCompanyDto) {
        // Check if email exists
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Check if company name exists
        const existingCompany = await this.companiesRepository.findOne({
            where: { name: registerDto.companyName },
        });
        if (existingCompany) {
            throw new ConflictException('Company name already exists');
        }

        // Generate unique company code
        const companyCode = this.generateCompanyCode();

        // Create company
        const company = this.companiesRepository.create({
            name: registerDto.companyName,
            companyCode,
            subscriptionStatus: SubscriptionStatus.TRIAL,
            trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            isActive: true,
        });
        await this.companiesRepository.save(company);

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create company admin user
        const user = this.usersRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: UserRole.COMPANY_ADMIN,
            companyId: company.id,
            isActive: true,
        });
        await this.usersRepository.save(user);

        return this.login({ email: user.email, password: registerDto.password });
    }

    async registerUser(registerDto: RegisterUserDto) {
        // Check if email exists
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Verify company code
        const company = await this.companiesRepository.findOne({
            where: { companyCode: registerDto.companyCode },
        });
        if (!company) {
            throw new BadRequestException('Invalid company code');
        }

        if (!company.isActive) {
            throw new BadRequestException('Company is not active');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user
        const user = this.usersRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: UserRole.USER,
            companyId: company.id,
            isActive: true,
        });
        await this.usersRepository.save(user);

        return this.login({ email: user.email, password: registerDto.password });
    }

    private generateCompanyCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }
}