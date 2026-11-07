import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { buildSimpleInvoicePdf } from '../../integrations/invoice/pdf.util';

@Injectable()
export class ZatcaService {
  private readonly logger = new Logger(ZatcaService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async generateQrTlv(data: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    total: string;
    vatAmount: string;
  }): Promise<string> {
    const tags = [
      this.tlv(1, data.sellerName),
      this.tlv(2, data.vatNumber),
      this.tlv(3, data.timestamp),
      this.tlv(4, data.total),
      this.tlv(5, data.vatAmount),
    ];
    return Buffer.concat(tags).toString('base64');
  }

  async submitToFatoora(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { lines: true, tenant: true },
    });

    const zatcaUuid = uuidv4();
    const qrCode = await this.generateQrTlv({
      sellerName: invoice.tenant.name,
      vatNumber: this.config.get('ZATCA_VAT_NUMBER', '300000000000003'),
      timestamp: invoice.issuedAt.toISOString(),
      total: invoice.total.toString(),
      vatAmount: invoice.vatAmount.toString(),
    });

    const sandboxUrl = this.config.get('ZATCA_SANDBOX_URL');
    let response: Record<string, unknown> = {
      status: 'submitted',
      environment: 'sandbox-local',
      note: 'Local ZATCA TLV QR generated; Fatoora HTTP skipped (ZATCA_SANDBOX_URL unset)',
    };

    if (sandboxUrl) {
      try {
        const res = await fetch(`${sandboxUrl}/invoices/reporting/single`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.get('ZATCA_API_TOKEN', '')}`,
          },
          body: JSON.stringify({
            uuid: zatcaUuid,
            invoiceHash: qrCode,
            invoiceNumber: invoice.invoiceNumber,
          }),
        });
        response = (await res.json()) as Record<string, unknown>;
      } catch (err) {
        this.logger.warn(`ZATCA sandbox submit error: ${String(err)}`);
        response = { status: 'sandbox_error', message: String(err) };
      }
    }

    const submission = await this.prisma.invoiceZatcaSubmission.create({
      data: {
        invoiceId,
        submissionType: invoice.type === 'standard' ? 'clearance' : 'reporting',
        zatcaUuid,
        qrCode,
        response: response as Prisma.InputJsonValue,
      },
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { zatcaStatus: 'submitted' },
    });

    return submission;
  }

  private tlv(tag: number, value: string): Buffer {
    const valueBytes = Buffer.from(value, 'utf8');
    const tagBuf = Buffer.from([tag]);
    const lengthBuf = Buffer.from([valueBytes.length]);
    return Buffer.concat([tagBuf, lengthBuf, valueBytes]);
  }
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private zatca: ZatcaService,
  ) {}

  async createFromOrder(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId },
      include: {
        tankSize: true,
        customer: { include: { profile: true } },
      },
    });

    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(8, '0')}`;
    const lang = order.customer.profile?.preferredLanguage === 'en' ? 'en' : 'ar';
    const tankLabel =
      lang === 'en' ? order.tankSize.nameEn : order.tankSize.nameAr;
    const descPrefix = lang === 'en' ? 'Water delivery' : 'توصيل مياه';
    const description = `${descPrefix} - ${tankLabel} (${order.tankSize.capacityLiters}L)`;

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        orderId,
        invoiceNumber,
        type: 'simplified',
        subtotal: order.subtotal,
        vatAmount: order.vatAmount,
        total: order.totalAmount,
        lines: {
          create: [{
            description,
            quantity: new Decimal(1),
            unitPrice: order.subtotal,
            vatRate: new Decimal(15),
            total: order.totalAmount,
          }],
        },
      },
      include: { lines: true },
    });

    const submission = await this.zatca.submitToFatoora(invoice.id);
    await this.attachPdf(invoice.id, submission.qrCode ?? undefined);
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id: invoice.id },
      include: { lines: true, zatcaSubmission: true },
    });
  }

  async attachPdf(invoiceId: string, qrTlv?: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: {
        tenant: true,
        zatcaSubmission: true,
        order: { include: { customer: { include: { profile: true } } } },
      },
    });

    const qr = qrTlv ?? invoice.zatcaSubmission?.qrCode ?? undefined;
    const customerName =
      invoice.order?.customer?.profile?.nameAr ??
      invoice.order?.customer?.profile?.nameEn ??
      invoice.order?.customer?.phone ??
      '';

    const pdf = buildSimpleInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      sellerName: invoice.tenant.name,
      customerName,
      issuedAt: invoice.issuedAt.toISOString(),
      total: invoice.total.toString(),
      vatAmount: invoice.vatAmount.toString(),
      qrTlvBase64: qr,
    });

    const pdfUrl = `data:application/pdf;base64,${pdf.toString('base64')}`;
    this.logger.log(`Invoice PDF attached for ${invoice.invoiceNumber} (${pdf.length} bytes)`);

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfUrl },
    });
  }

  async getPdf(invoiceId: string, tenantId?: string) {
    const invoice = await this.prisma.invoice.findFirstOrThrow({
      where: tenantId ? { id: invoiceId, tenantId } : { id: invoiceId },
      include: { zatcaSubmission: true },
    });

    if (!invoice.pdfUrl) {
      await this.attachPdf(invoiceId, invoice.zatcaSubmission?.qrCode ?? undefined);
      return this.prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    }
    return invoice;
  }

  async findByCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      select: { id: true },
    });
    return this.prisma.invoice.findMany({
      where: { orderId: { in: orders.map((o) => o.id) } },
      include: { zatcaSubmission: true },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
