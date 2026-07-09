import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async send(
    userId: string,
    channel: 'push' | 'sms' | 'whatsapp' | 'email' | 'in_app',
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, channel, title, body, data: (data ?? {}) as object },
    });

    // Channel dispatch stubs — integrate FCM/Unifonic/Twilio/SES in production
    switch (channel) {
      case 'push':
        console.log(`[FCM] ${userId}: ${title}`);
        break;
      case 'sms':
        console.log(`[SMS] ${userId}: ${body}`);
        break;
      case 'whatsapp':
        console.log(`[WhatsApp] ${userId}: ${body}`);
        break;
      case 'email':
        console.log(`[Email] ${userId}: ${title}`);
        break;
    }

    return notification;
  }

  async getForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }
}
