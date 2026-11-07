import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { OpsAlertsService } from './ops-alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'supplier')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private opsAlerts: OpsAlertsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard KPIs' })
  dashboard(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getDashboard(user.tenantId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Order trends by day' })
  trends(@CurrentUser() user: JwtPayload, @Query('days') days?: number) {
    return this.analyticsService.getOrderTrends(user.tenantId, days);
  }

  @Get('ops-alerts')
  @ApiOperation({
    summary: 'Delayed delivery / overloaded supplier alerts (locale-aware copy)',
  })
  opsAlertsEndpoint(
    @CurrentUser() user: JwtPayload,
    @Locale() locale: AppLocale,
  ) {
    return this.opsAlerts.getAlerts(user.tenantId, locale);
  }

  @Get('export/orders')
  @Roles('admin')
  @ApiOperation({ summary: 'Export orders for date range' })
  export(
    @CurrentUser() user: JwtPayload,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.analyticsService.exportOrders(
      user.tenantId,
      new Date(from),
      new Date(to),
    );
  }
}
