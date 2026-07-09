import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Accounting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  @Get('ledger')
  @ApiOperation({ summary: 'Get general ledger' })
  ledger(
    @CurrentUser() user: JwtPayload,
    @Query('accountCode') accountCode?: string,
  ) {
    return this.accountingService.getLedger(user.tenantId, accountCode);
  }

  @Get('reports/pl')
  @ApiOperation({ summary: 'Profit & Loss report' })
  profitAndLoss(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.accountingService.getProfitAndLoss(
      user.tenantId,
      new Date(from),
      new Date(to),
    );
  }
}
