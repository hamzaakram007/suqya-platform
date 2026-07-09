import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async applyForCredit(customerId: string, tenantId: string, requestedLimit: number) {
    const existing = await this.prisma.creditAccount.findUnique({
      where: { customerId },
    });
    if (existing) {
      throw new BadRequestException('Credit account already exists');
    }

    return this.prisma.creditAccount.create({
      data: {
        tenantId,
        customerId,
        creditLimit: new Decimal(requestedLimit),
        status: 'pending',
      },
    });
  }

  async approveCredit(accountId: string, approvedBy: string, limit?: number) {
    return this.prisma.creditAccount.update({
      where: { id: accountId },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        ...(limit !== undefined && { creditLimit: new Decimal(limit) }),
      },
    });
  }

  async getStatement(customerId: string) {
    const account = await this.prisma.creditAccount.findUnique({
      where: { customerId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!account) throw new BadRequestException('No credit account');

    return {
      creditLimit: account.creditLimit,
      outstandingBalance: account.outstandingBalance,
      availableCredit: account.creditLimit.sub(account.outstandingBalance),
      status: account.status,
      transactions: account.transactions,
    };
  }

  async recordPayment(customerId: string, amount: number) {
    const account = await this.prisma.creditAccount.findUniqueOrThrow({
      where: { customerId },
    });

    const paymentAmount = new Decimal(amount);

    await this.prisma.$transaction([
      this.prisma.creditTransaction.create({
        data: {
          creditAccountId: account.id,
          amount: paymentAmount.neg(),
          type: 'payment',
          paidAt: new Date(),
        },
      }),
      this.prisma.creditAccount.update({
        where: { id: account.id },
        data: {
          outstandingBalance: account.outstandingBalance.sub(paymentAmount),
        },
      }),
    ]);

    return { message: 'Payment recorded', amount };
  }

  async getAgingReport(tenantId: string) {
    const accounts = await this.prisma.creditAccount.findMany({
      where: { tenantId, status: 'approved' },
      include: {
        customer: { include: { profile: true } },
        transactions: {
          where: { type: 'charge', paidAt: null },
        },
      },
    });

    const now = new Date();
    return accounts.map((account) => {
      const buckets = { current: 0, days30: 0, days60: 0, days90: 0 };

      for (const txn of account.transactions) {
        if (!txn.dueDate) continue;
        const daysOverdue = Math.floor(
          (now.getTime() - txn.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const amt = Number(txn.amount);
        if (daysOverdue <= 0) buckets.current += amt;
        else if (daysOverdue <= 30) buckets.days30 += amt;
        else if (daysOverdue <= 60) buckets.days60 += amt;
        else buckets.days90 += amt;
      }

      return {
        customerId: account.customerId,
        customerName: account.customer.profile?.nameAr,
        outstandingBalance: account.outstandingBalance,
        aging: buckets,
      };
    });
  }

  async sendReminders(tenantId: string) {
    const accounts = await this.prisma.creditAccount.findMany({
      where: { tenantId, status: 'approved', outstandingBalance: { gt: 0 } },
      include: {
        transactions: {
          where: { type: 'charge', paidAt: null, dueDate: { lte: new Date(Date.now() + 7 * 86400000) } },
        },
      },
    });

    const reminders = [];
    for (const account of accounts) {
      for (const txn of account.transactions) {
        const reminder = await this.prisma.paymentReminder.create({
          data: {
            creditAccountId: account.id,
            channel: 'sms',
            dueDate: txn.dueDate!,
          },
        });
        reminders.push(reminder);
        // TODO: Queue notification job via BullMQ
      }
    }

    return { sent: reminders.length };
  }
}
