import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { AppLocale } from '../../common/locale/locale.types';
import { normalizeLocale } from '../../common/locale/locale.util';

export type DocumentLayout = 'ar' | 'en' | 'bilingual';

const copy = {
  ar: {
    invoice: 'فاتورة',
    receipt: 'إيصال',
    invoiceNumber: 'رقم الفاتورة',
    date: 'التاريخ',
    customer: 'العميل',
    description: 'الوصف',
    qty: 'الكمية',
    amount: 'المبلغ',
    subtotal: 'المجموع الفرعي',
    vat: 'ضريبة القيمة المضافة (15%)',
    total: 'الإجمالي',
    waterDelivery: 'توصيل مياه',
    thankYou: 'شكراً لاستخدام سقيا',
  },
  en: {
    invoice: 'Invoice',
    receipt: 'Receipt',
    invoiceNumber: 'Invoice number',
    date: 'Date',
    customer: 'Customer',
    description: 'Description',
    qty: 'Qty',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT (15%)',
    total: 'Total',
    waterDelivery: 'Water delivery',
    thankYou: 'Thank you for using Suqya',
  },
} as const;

@Injectable()
export class DocumentTemplateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Build printable document payload. Layout:
   * - ar / en: single-language
   * - bilingual: both columns (human-reviewed copy keys only)
   */
  async renderInvoice(
    invoiceId: string,
    layout: DocumentLayout = 'bilingual',
    localeHint?: AppLocale,
  ) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: {
        lines: true,
        tenant: true,
        order: {
          include: {
            customer: { include: { profile: true } },
            tankSize: true,
          },
        },
      },
    });

    const preferred = normalizeLocale(
      localeHint ?? invoice.order?.customer?.profile?.preferredLanguage,
    );
    const effectiveLayout: DocumentLayout =
      layout === 'bilingual' ? 'bilingual' : preferred;

    const tank = invoice.order?.tankSize;
    const lineDescAr = tank
      ? `${copy.ar.waterDelivery} — ${tank.nameAr} (${tank.capacityLiters}L)`
      : copy.ar.waterDelivery;
    const lineDescEn = tank
      ? `${copy.en.waterDelivery} — ${tank.nameEn} (${tank.capacityLiters}L)`
      : copy.en.waterDelivery;

    const customerName =
      preferred === 'en'
        ? invoice.order?.customer?.profile?.nameEn ??
          invoice.order?.customer?.profile?.nameAr ??
          ''
        : invoice.order?.customer?.profile?.nameAr ??
          invoice.order?.customer?.profile?.nameEn ??
          '';

    const labels =
      effectiveLayout === 'en'
        ? copy.en
        : effectiveLayout === 'ar'
          ? copy.ar
          : null;

    return {
      layout: effectiveLayout,
      dir: effectiveLayout === 'en' ? 'ltr' : 'rtl',
      locale: preferred,
      meta: {
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt.toISOString(),
        tenantNameAr: invoice.tenant.nameAr ?? invoice.tenant.name,
        tenantNameEn: invoice.tenant.nameEn ?? invoice.tenant.name,
      },
      labels: labels ?? { ar: copy.ar, en: copy.en },
      customerName,
      lines: invoice.lines.map((l) => ({
        descriptionAr: lineDescAr,
        descriptionEn: lineDescEn,
        description:
          preferred === 'en' ? lineDescEn : lineDescAr,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        total: Number(l.total),
      })),
      amounts: {
        subtotal: Number(invoice.subtotal),
        vatAmount: Number(invoice.vatAmount),
        total: Number(invoice.total),
      },
      html: this.toHtml({
        layout: effectiveLayout,
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt,
        tenantAr: invoice.tenant.nameAr ?? invoice.tenant.name,
        tenantEn: invoice.tenant.nameEn ?? invoice.tenant.name,
        customerName,
        lineDescAr,
        lineDescEn,
        subtotal: Number(invoice.subtotal),
        vat: Number(invoice.vatAmount),
        total: Number(invoice.total),
      }),
    };
  }

  private toHtml(p: {
    layout: DocumentLayout;
    invoiceNumber: string;
    issuedAt: Date;
    tenantAr: string;
    tenantEn: string;
    customerName: string;
    lineDescAr: string;
    lineDescEn: string;
    subtotal: number;
    vat: number;
    total: number;
  }): string {
    const date = p.issuedAt.toISOString().slice(0, 10);
    if (p.layout === 'bilingual') {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${p.invoiceNumber}</title>
<style>body{font-family:Tahoma,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}.row{display:flex;gap:24px}.col{flex:1}</style></head>
<body><div class="row">
<div class="col" dir="rtl"><h1>${copy.ar.invoice}</h1><p>${copy.ar.invoiceNumber}: ${p.invoiceNumber}</p>
<p>${copy.ar.date}: ${date}</p><p>${p.tenantAr}</p><p>${copy.ar.customer}: ${p.customerName}</p>
<table><tr><th>${copy.ar.description}</th><th>${copy.ar.amount}</th></tr>
<tr><td>${p.lineDescAr}</td><td>${p.total.toFixed(2)}</td></tr></table>
<p>${copy.ar.subtotal}: ${p.subtotal.toFixed(2)}</p>
<p>${copy.ar.vat}: ${p.vat.toFixed(2)}</p>
<p><strong>${copy.ar.total}: ${p.total.toFixed(2)}</strong></p>
<p>${copy.ar.thankYou}</p></div>
<div class="col" dir="ltr"><h1>${copy.en.invoice}</h1><p>${copy.en.invoiceNumber}: ${p.invoiceNumber}</p>
<p>${copy.en.date}: ${date}</p><p>${p.tenantEn}</p><p>${copy.en.customer}: ${p.customerName}</p>
<table><tr><th>${copy.en.description}</th><th>${copy.en.amount}</th></tr>
<tr><td>${p.lineDescEn}</td><td>${p.total.toFixed(2)}</td></tr></table>
<p>${copy.en.subtotal}: ${p.subtotal.toFixed(2)}</p>
<p>${copy.en.vat}: ${p.vat.toFixed(2)}</p>
<p><strong>${copy.en.total}: ${p.total.toFixed(2)}</strong></p>
<p>${copy.en.thankYou}</p></div>
</div></body></html>`;
    }
    const L = p.layout === 'en' ? copy.en : copy.ar;
    const dir = p.layout === 'en' ? 'ltr' : 'rtl';
    const tenant = p.layout === 'en' ? p.tenantEn : p.tenantAr;
    const desc = p.layout === 'en' ? p.lineDescEn : p.lineDescAr;
    return `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"/><title>${p.invoiceNumber}</title>
<style>body{font-family:Tahoma,Arial,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head>
<body><h1>${L.invoice}</h1><p>${L.invoiceNumber}: ${p.invoiceNumber}</p>
<p>${L.date}: ${date}</p><p>${tenant}</p><p>${L.customer}: ${p.customerName}</p>
<table><tr><th>${L.description}</th><th>${L.amount}</th></tr>
<tr><td>${desc}</td><td>${p.total.toFixed(2)}</td></tr></table>
<p>${L.subtotal}: ${p.subtotal.toFixed(2)}</p>
<p>${L.vat}: ${p.vat.toFixed(2)}</p>
<p><strong>${L.total}: ${p.total.toFixed(2)}</strong></p>
<p>${L.thankYou}</p></body></html>`;
  }
}
