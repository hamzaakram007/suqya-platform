import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppLocale, DEFAULT_LOCALE } from '../../common/locale/locale.types';
import { normalizeLocale } from '../../common/locale/locale.util';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async resolveLocale(userId: string): Promise<AppLocale> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { preferredLanguage: true },
    });
    return normalizeLocale(profile?.preferredLanguage);
  }

  async sendFromTemplate(
    userId: string,
    event: string,
    channel: 'push' | 'sms' | 'whatsapp' | 'email' | 'in_app',
    vars: Record<string, string> = {},
    data?: Record<string, unknown>,
  ) {
    const locale = await this.resolveLocale(userId);
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { event, channel },
    });

    let title: string;
    let body: string;
    if (template) {
      title = locale === 'en' ? template.titleEn : template.titleAr;
      body = locale === 'en' ? template.bodyEn : template.bodyAr;
    } else {
      title = locale === 'en' ? 'Suqya' : 'سقيا';
      body = locale === 'en' ? 'You have a new notification' : 'لديك إشعار جديد';
    }

    for (const [k, v] of Object.entries(vars)) {
      title = title.replaceAll(`{{${k}}}`, v);
      body = body.replaceAll(`{{${k}}}`, v);
    }

    return this.send(userId, channel, title, body, data, event);
  }

  async send(
    userId: string,
    channel: 'push' | 'sms' | 'whatsapp' | 'email' | 'in_app',
    title: string,
    body: string,
    data?: Record<string, unknown>,
    eventKey?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        channel,
        title,
        body,
        eventKey,
        data: (data ?? {}) as object,
      },
    });

    await this.notificationQueue.add('dispatch', {
      notificationId: notification.id,
      userId,
      channel,
      title,
      body,
    });

    return notification;
  }

  async sendOrderCompleted(data: {
    orderId: string;
    customerId: string;
    customerPhone: string;
    customerName: string;
    orderNumber: string;
  }) {
    await this.sendFromTemplate(
      data.customerId,
      'order.completed',
      'push',
      { orderNumber: data.orderNumber },
      { orderId: data.orderId },
    );
    const locale = await this.resolveLocale(data.customerId);
    const smsBody =
      locale === 'en'
        ? `Suqya: Your order ${data.orderNumber} is complete`
        : `سقيا: تم إكمال طلبك ${data.orderNumber}`;
    await this.notificationQueue.add('sms', {
      phone: data.customerPhone,
      body: smsBody,
    });
  }

  /** Resolve display copy from template when eventKey is set. */
  async getForUser(userId: string, page = 1, limit = 20, locale?: AppLocale) {
    const skip = (page - 1) * limit;
    const lang = locale ?? (await this.resolveLocale(userId));
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const eventKeys = [...new Set(rows.map((r) => r.eventKey).filter(Boolean))] as string[];
    const templates =
      eventKeys.length === 0
        ? []
        : await this.prisma.notificationTemplate.findMany({
            where: { event: { in: eventKeys } },
          });
    const byEvent = new Map(templates.map((t) => [t.event, t]));

    return rows.map((n) => {
      if (!n.eventKey) return n;
      const tpl = byEvent.get(n.eventKey);
      if (!tpl) return n;
      return {
        ...n,
        title: lang === 'en' ? tpl.titleEn : tpl.titleAr,
        body: lang === 'en' ? tpl.bodyEn : tpl.bodyAr,
      };
    });
  }
}
