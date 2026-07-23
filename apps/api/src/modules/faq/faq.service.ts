import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { AppLocale } from '../../common/locale/locale.types';
import { localizeFaq } from '../../common/locale/locale.util';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string | undefined, locale: AppLocale, category?: string) {
    const faqs = await this.prisma.faq.findMany({
      where: {
        isActive: true,
        OR: [{ tenantId: null }, ...(tenantId ? [{ tenantId }] : [])],
        ...(category ? { category } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return faqs.map((f) => localizeFaq(f, locale));
  }
}
