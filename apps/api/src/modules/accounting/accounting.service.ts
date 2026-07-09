import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

const DEFAULT_ACCOUNTS = [
  { code: '1000', nameAr: 'النقدية', nameEn: 'Cash', accountType: 'asset' },
  { code: '1100', nameAr: 'ذمم مدينة', nameEn: 'Accounts Receivable', accountType: 'asset' },
  { code: '2000', nameAr: 'ذمم دائنة', nameEn: 'Accounts Payable', accountType: 'liability' },
  { code: '2100', nameAr: 'ضريبة القيمة المضافة', nameEn: 'VAT Payable', accountType: 'liability' },
  { code: '4000', nameAr: 'إيرادات التوصيل', nameEn: 'Delivery Revenue', accountType: 'revenue' },
  { code: '5000', nameAr: 'عمولات المنصة', nameEn: 'Platform Commission', accountType: 'expense' },
];

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  async seedChartOfAccounts(tenantId: string) {
    for (const account of DEFAULT_ACCOUNTS) {
      await this.prisma.chartOfAccount.upsert({
        where: { tenantId_code: { tenantId, code: account.code } },
        create: { tenantId, ...account },
        update: {},
      });
    }
  }

  async postOrderJournal(tenantId: string, orderId: string) {
    await this.ensureChartOfAccounts(tenantId);

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId },
    });

    const getAccount = (code: string) =>
      accounts.find((a) => a.code === code)!.id;

    return this.prisma.journalEntry.create({
      data: {
        tenantId,
        referenceType: 'order',
        referenceId: orderId,
        description: `Order ${order.orderNumber} completed`,
        lines: {
          create: [
            { accountId: getAccount('1000'), debit: order.totalAmount, credit: new Decimal(0) },
            { accountId: getAccount('4000'), debit: new Decimal(0), credit: order.subtotal },
            { accountId: getAccount('2100'), debit: new Decimal(0), credit: order.vatAmount },
          ],
        },
      },
      include: { lines: { include: { account: true } } },
    });
  }

  private async ensureChartOfAccounts(tenantId: string) {
    const count = await this.prisma.chartOfAccount.count({ where: { tenantId } });
    if (count === 0) {
      await this.seedChartOfAccounts(tenantId);
    }
  }

  async getLedger(tenantId: string, accountCode?: string) {
    const where = accountCode
      ? { journalEntry: { tenantId }, account: { code: accountCode } }
      : { journalEntry: { tenantId } };

    return this.prisma.journalLine.findMany({
      where,
      include: {
        account: true,
        journalEntry: true,
      },
      orderBy: { journalEntry: { postedAt: 'desc' } },
      take: 100,
    });
  }

  async getProfitAndLoss(tenantId: string, from: Date, to: Date) {
    const lines = await this.prisma.journalLine.findMany({
      where: {
        journalEntry: { tenantId, postedAt: { gte: from, lte: to } },
        account: { accountType: { in: ['revenue', 'expense'] } },
      },
      include: { account: true },
    });

    let revenue = new Decimal(0);
    let expenses = new Decimal(0);

    for (const line of lines) {
      if (line.account.accountType === 'revenue') {
        revenue = revenue.add(line.credit).sub(line.debit);
      } else {
        expenses = expenses.add(line.debit).sub(line.credit);
      }
    }

    return {
      revenue: revenue.toNumber(),
      expenses: expenses.toNumber(),
      netProfit: revenue.sub(expenses).toNumber(),
      period: { from, to },
    };
  }
}
