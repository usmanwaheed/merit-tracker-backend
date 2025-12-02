
// src/modules/users/users.controller.ts
import { Controller, Get, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get all users in company' })
    async findAll(@CurrentUser() user: User) {
        return this.usersService.findAll(user.companyId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get company leaderboard' })
    async getLeaderboard(@CurrentUser() user: User) {
        return this.usersService.getLeaderboard(user.companyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.usersService.findOne(id, user.companyId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user profile' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto,
        @CurrentUser() user: User,
    ) {
        return this.usersService.update(id, updateDto, user);
    }

    @Patch(':id/role')
    @ApiOperation({ summary: 'Update user role' })
    async updateRole(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserRoleDto,
        @CurrentUser() user: User,
    ) {
        return this.usersService.updateRole(id, updateDto, user);
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Deactivate user' })
    async deactivate(@Param('id') id: string, @CurrentUser() user: User) {
        return this.usersService.deactivate(id, user);
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activate user' })
    async activate(@Param('id') id: string, @CurrentUser() user: User) {
        return this.usersService.activate(id, user);
    }
}
