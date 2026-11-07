import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
      include: { ledger: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async topUp(userId: string, amount: number, referenceId?: string) {
    const wallet = await this.getOrCreate(userId);
    const amt = new Decimal(amount);

    return this.prisma.$transaction([
      this.prisma.walletLedger.create({
        data: {
          walletId: wallet.id,
          amount: amt,
          type: 'topup',
          referenceId,
          description: 'Wallet top-up',
        },
      }),
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance.add(amt) },
      }),
    ]);
  }

  async debit(userId: string, amount: Decimal, referenceId: string, description: string) {
    const wallet = await this.getOrCreate(userId);
    if (wallet.balance.lt(amount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await this.prisma.$transaction([
      this.prisma.walletLedger.create({
        data: {
          walletId: wallet.id,
          amount: amount.neg(),
          type: 'debit',
          referenceId,
          description,
        },
      }),
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance.sub(amount) },
      }),
    ]);
  }
}
