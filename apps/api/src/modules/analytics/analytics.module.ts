import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { OpsAlertsService } from './ops-alerts.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, OpsAlertsService],
  exports: [AnalyticsService, OpsAlertsService],
})
export class AnalyticsModule {}
