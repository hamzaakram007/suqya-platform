import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.module';
import { SMS_PROVIDER, SmsProvider, isPlaceholderSecret } from '../sms/sms.types';
import { Inject } from '@nestjs/common';

export type DeliveryChannel = 'push' | 'sms' | 'whatsapp' | 'email' | 'in_app';

/**
 * Channel delivery with sandbox bookkeeping when FCM / Unifonic keys are absent.
 * Updates notification.data with delivery metadata so E2E can assert without console scraping.
 */
@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(SMS_PROVIDER) private sms: SmsProvider,
  ) {}

  pushMode(): 'sandbox' | 'fcm' {
    const forced = (this.config.get<string>('PUSH_PROVIDER') ?? 'auto').toLowerCase();
    if (forced === 'sandbox') return 'sandbox';
    if (forced === 'fcm') return 'fcm';
    return isPlaceholderSecret(this.config.get('FCM_SERVER_KEY')) ? 'sandbox' : 'fcm';
  }

  async deliver(job: {
    notificationId?: string;
    userId?: string;
    phone?: string;
    channel: DeliveryChannel | string;
    title?: string;
    body: string;
  }) {
    const channel = job.channel;
    let result: Record<string, unknown>;

    if (channel === 'sms') {
      const phone = job.phone;
      if (!phone) {
        result = { ok: false, reason: 'missing_phone', provider: this.sms.name };
      } else {
        const sent = await this.sms.sendSms(phone, job.body);
        result = { ok: true, ...sent };
      }
    } else if (channel === 'push') {
      const mode = this.pushMode();
      if (mode === 'sandbox') {
        this.logger.log(
          `[sandbox-fcm] user=${job.userId} title=${job.title ?? ''} len=${job.body.length}`,
        );
        result = {
          ok: true,
          provider: 'sandbox',
          messageId: `sandbox-push-${job.notificationId ?? job.userId}`,
        };
      } else {
        // Real FCM would go here when FCM_SERVER_KEY is configured.
        this.logger.warn(
          '[fcm] FCM_SERVER_KEY set but HTTP sender not wired — recording as pending',
        );
        result = { ok: false, provider: 'fcm', reason: 'not_wired' };
      }
    } else if (channel === 'in_app') {
      result = { ok: true, provider: 'in_app' };
    } else {
      this.logger.log(
        `[sandbox-${channel}] user=${job.userId} title=${job.title ?? ''} (no live provider)`,
      );
      result = {
        ok: true,
        provider: 'sandbox',
        messageId: `sandbox-${channel}-${job.notificationId ?? 'na'}`,
      };
    }

    if (job.notificationId) {
      const existing = await this.prisma.notification.findUnique({
        where: { id: job.notificationId },
      });
      const prev =
        existing?.data && typeof existing.data === 'object' && !Array.isArray(existing.data)
          ? (existing.data as Record<string, unknown>)
          : {};
      await this.prisma.notification.update({
        where: { id: job.notificationId },
        data: {
          data: {
            ...prev,
            delivery: { ...result, deliveredAt: new Date().toISOString() },
          },
        },
      });
    }

    return result;
  }
}
