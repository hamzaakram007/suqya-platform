import { Module } from '@nestjs/common';
import { SubscriptionService, LoyaltyService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, LoyaltyService],
  exports: [SubscriptionService, LoyaltyService],
})
export class SubscriptionModule {}
