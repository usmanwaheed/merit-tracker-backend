// src/modules/users/users.controller.ts
import { Controller, Get, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/users.dto';
import { CurrentUser } from '../auth/guards';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users in company' })
    async findAll(@CurrentUser('companyId') companyId: string) {
        return this.usersService.findAll(companyId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get company leaderboard' })
    async getLeaderboard(@CurrentUser('companyId') companyId: string) {
        return this.usersService.getLeaderboard(companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
        return this.usersService.findOne(id, companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user profile' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto,
        @CurrentUser() currentUser: any, // Get the full user object
    ) {
        // No need to create a minimal object, pass the current user directly
        return this.usersService.update(id, updateDto, currentUser);
    }

    @Patch(':id/role')
    @ApiOperation({ summary: 'Update user role' })
    async updateRole(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserRoleDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.usersService.updateRole(id, updateDto, currentUser);
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate user' })
    async deactivate(
        @Param('id') id: string,
        @CurrentUser() currentUser: any,
    ) {
        return this.usersService.deactivate(id, currentUser);
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate user' })
    async activate(
        @Param('id') id: string,
        @CurrentUser() currentUser: any,
    ) {
        return this.usersService.activate(id, currentUser);
    }
}