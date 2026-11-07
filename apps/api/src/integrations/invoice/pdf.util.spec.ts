import { buildSimpleInvoicePdf } from './pdf.util';

describe('buildSimpleInvoicePdf', () => {
  it('returns a valid PDF header and embeds ZATCA TLV', () => {
    const pdf = buildSimpleInvoicePdf({
      invoiceNumber: 'INV-00000001',
      sellerName: 'Suqya',
      customerName: 'عميل',
      issuedAt: '2026-11-07T00:00:00.000Z',
      total: '172.50',
      vatAmount: '22.50',
      qrTlvBase64: 'AQVTdXF5YQ==',
    });
    expect(pdf.slice(0, 5).toString('utf8')).toBe('%PDF-');
    expect(pdf.toString('utf8')).toContain('ZATCA-QR-TLV');
    expect(pdf.toString('utf8')).toContain('INV-00000001');
  });
});
