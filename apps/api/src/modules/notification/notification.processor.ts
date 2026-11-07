import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { NotificationDeliveryService } from '../../integrations/notifications/delivery.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private delivery: NotificationDeliveryService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'dispatch') {
      const { channel, userId, title, body, notificationId } = job.data;
      const result = await this.delivery.deliver({
        notificationId,
        userId,
        channel,
        title,
        body,
      });
      this.logger.debug(`notification dispatch result=${JSON.stringify(result)}`);
      return { processed: true, ...result };
    }
    if (job.name === 'sms') {
      const result = await this.delivery.deliver({
        phone: job.data.phone,
        channel: 'sms',
        body: job.data.body,
        notificationId: job.data.notificationId,
      });
      return { processed: true, ...result };
    }
    return { processed: true };
  }
}
