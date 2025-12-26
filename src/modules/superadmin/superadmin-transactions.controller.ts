import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipSubscriptionCheck } from '../auth/guards';
import { SuperadminJwtGuard } from './guards/superadmin-jwt.guard';
import { SuperadminTransactionsQueryDto } from './dto/superadmin-transactions.dto';
import { SuperadminTransactionsService } from './superadmin-transactions.service';

@ApiTags('superadmin-transactions')
@ApiBearerAuth()
@Controller('superadmin/transactions')
@UseGuards(SuperadminJwtGuard)
export class SuperadminTransactionsController {
    constructor(private readonly transactionsService: SuperadminTransactionsService) { }

    @Get()
    @SkipSubscriptionCheck()
    @ApiOperation({ summary: 'List subscription transactions' })
    async listTransactions(@Query() query: SuperadminTransactionsQueryDto) {
        return this.transactionsService.listTransactions(query);
    }
}