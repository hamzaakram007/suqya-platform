import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job) {
    if (job.name === 'dispatch') {
      const { channel, userId, title, body } = job.data;
      switch (channel) {
        case 'push':
          this.logger.log(`[FCM] ${userId}: ${title}`);
          break;
        case 'sms':
          this.logger.log(`[SMS] ${userId}: ${body}`);
          break;
        case 'whatsapp':
          this.logger.log(`[WhatsApp] ${userId}: ${body}`);
          break;
        case 'email':
          this.logger.log(`[Email] ${userId}: ${title}`);
          break;
      }
    }
    if (job.name === 'sms') {
      this.logger.log(`[Unifonic] ${job.data.phone}: ${job.data.body}`);
    }
    return { processed: true };
  }
}
