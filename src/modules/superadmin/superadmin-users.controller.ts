import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminUsersQueryDto } from './dto/superadmin-users.dto';
import { SuperadminUsersService } from './superadmin-users.service';

@ApiTags('superadmin-users')
@ApiBearerAuth()
@Controller('superadmin/users')
@UseGuards(SuperadminJwtGuard)
export class SuperadminUsersController {
    constructor(private readonly usersService: SuperadminUsersService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'List platform users' })
    async listUsers(@Query() query: SuperadminUsersQueryDto) {
        return this.usersService.listUsers(query);
    }
}