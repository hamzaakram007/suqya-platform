import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(tenantId: string, userId: string, subject: string, message: string) {
    return this.prisma.supportTicket.create({
      data: {
        tenantId,
        userId,
        subject,
        messages: {
          create: { senderId: userId, body: message },
        },
      },
      include: { messages: true },
    });
  }

  async reply(ticketId: string, senderId: string, body: string) {
    return this.prisma.ticketMessage.create({
      data: { ticketId, senderId, body },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listForTenant(tenantId: string, status?: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, ...(status && { status }) },
      include: {
        user: { include: { profile: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateStatus(ticketId: string, tenantId: string, status: string) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId, tenantId },
      data: { status },
    });
  }
}
