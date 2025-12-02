// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterCompanyDto, RegisterUserDto, LoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register/company')
    @ApiOperation({ summary: 'Register new company with admin user' })
    async registerCompany(@Body() registerDto: RegisterCompanyDto) {
        return this.authService.registerCompany(registerDto);
    }

    @Post('register/user')
    @ApiOperation({ summary: 'Register new user to existing company' })
    async registerUser(@Body() registerDto: RegisterUserDto) {
        return this.authService.registerUser(registerDto);
    }
}
