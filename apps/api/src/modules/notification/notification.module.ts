import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationController } from './notification.controller';
import { NotificationDeliveryService } from '../../integrations/notifications/delivery.service';
import { SmsModule } from '../../integrations/sms/sms.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' }), SmsModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationProcessor,
    NotificationDeliveryService,
  ],
  exports: [NotificationService, NotificationDeliveryService],
})
export class NotificationModule {}
