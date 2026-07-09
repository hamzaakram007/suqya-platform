import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ZatcaService {
  constructor(private prisma: PrismaService) {}

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
      vatNumber: '300000000000003',
      timestamp: invoice.issuedAt.toISOString(),
      total: invoice.total.toString(),
      vatAmount: invoice.vatAmount.toString(),
    });

    const submission = await this.prisma.invoiceZatcaSubmission.create({
      data: {
        invoiceId,
        submissionType: invoice.type === 'standard' ? 'clearance' : 'reporting',
        zatcaUuid,
        qrCode,
        response: { status: 'submitted', mock: true },
      },
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { zatcaStatus: 'submitted' },
    });

    // TODO: Real Fatoora API integration in production
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
  constructor(
    private prisma: PrismaService,
    private zatca: ZatcaService,
  ) {}

  async createFromOrder(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId },
      include: { tankSize: true },
    });

    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(8, '0')}`;

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
            description: `Water delivery - ${order.tankSize.nameEn} (${order.tankSize.capacityLiters}L)`,
            quantity: new Decimal(1),
            unitPrice: order.subtotal,
            vatRate: new Decimal(15),
            total: order.totalAmount,
          }],
        },
      },
      include: { lines: true },
    });

    await this.zatca.submitToFatoora(invoice.id);
    return invoice;
  }

  async findByCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      select: { id: true },
    });
    return this.prisma.invoice.findMany({
      where: { orderId: { in: orders.map((o) => o.id) } },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
