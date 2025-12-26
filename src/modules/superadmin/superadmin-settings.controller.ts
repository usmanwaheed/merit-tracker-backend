import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminUpdateSettingsDto } from './dto/superadmin-settings.dto';
import { SuperadminSettingsService } from './superadmin-settings.service';

@ApiTags('superadmin-settings')
@ApiBearerAuth()
@Controller('superadmin/settings')
@UseGuards(SuperadminJwtGuard)
export class SuperadminSettingsController {
    constructor(private readonly settingsService: SuperadminSettingsService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Get platform settings' })
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'Update platform settings' })
    async updateSettings(@Body() dto: SuperadminUpdateSettingsDto) {
        return this.settingsService.updateSettings(dto);
    }
}