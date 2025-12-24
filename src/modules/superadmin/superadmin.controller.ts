import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuperadminService } from './superadmin.service';
import { SuperadminLoginDto, SuperadminRegisterDto } from './dto/superadmin-auth.dto';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { CurrentUser, SkipSubscriptionCheck } from '../auth/guards';

@ApiTags('superadmin-auth')
@Controller('superadmin/auth')
export class SuperadminController {
    constructor(private readonly superadminService: SuperadminService) { }

    @Post('login')
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Superadmin login' })
    async login(@Body() loginDto: SuperadminLoginDto) {
        return this.superadminService.login(loginDto);
    }

    @Post('register')
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Register a new superadmin' })
    async register(@Body() registerDto: SuperadminRegisterDto) {
        return this.superadminService.register(registerDto);
    }

    @Get('me')
    @UseGuards(SuperadminJwtGuard)
    @SkipSubscriptionCheck()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current superadmin profile' })
    async getProfile(@CurrentUser('id') superadminId: string) {
        return this.superadminService.getProfile(superadminId);
    }
}