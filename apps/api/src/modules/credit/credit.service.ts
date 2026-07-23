import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async assertCreditAvailable(customerId: string, amount: Decimal) {
    const account = await this.prisma.creditAccount.findUnique({
      where: { customerId },
    });

    if (!account || account.status !== 'approved') {
      throw new BadRequestException('Credit account not approved');
    }

    const available = account.creditLimit.sub(account.outstandingBalance);
    if (available.lt(amount)) {
      throw new BadRequestException('Insufficient credit limit');
    }

    return account;
  }

  async chargeOnOrder(
    customerId: string,
    orderId: string,
    amount: Decimal,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    const account = await db.creditAccount.findUniqueOrThrow({
      where: { customerId },
    });

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.creditTransaction.create({
      data: {
        creditAccountId: account.id,
        orderId,
        amount,
        type: 'charge',
        dueDate,
      },
    });

    await db.creditAccount.update({
      where: { id: account.id },
      data: {
        outstandingBalance: account.outstandingBalance.add(amount),
      },
    });
  }

  async reverseCharge(customerId: string, orderId: string) {
    const account = await this.prisma.creditAccount.findUnique({
      where: { customerId },
    });
    if (!account) return;

    const charge = await this.prisma.creditTransaction.findFirst({
      where: { creditAccountId: account.id, orderId, type: 'charge' },
    });
    if (!charge) return;

    await this.prisma.$transaction([
      this.prisma.creditTransaction.create({
        data: {
          creditAccountId: account.id,
          orderId,
          amount: charge.amount.neg(),
          type: 'reversal',
        },
      }),
      this.prisma.creditAccount.update({
        where: { id: account.id },
        data: {
          outstandingBalance: account.outstandingBalance.sub(charge.amount),
        },
      }),
    ]);
  }

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
          where: {
            type: 'charge',
            paidAt: null,
            dueDate: { lte: new Date(Date.now() + 7 * 86400000) },
          },
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
      }
    }

    return { sent: reminders.length };
  }
}
