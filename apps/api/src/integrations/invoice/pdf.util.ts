/**
 * Minimal single-page PDF writer (no native deps) for B2C simplified invoices.
 * Embeds ZATCA TLV QR as plain text (Base64) — clients/renderers can encode to QR image.
 */
export function buildSimpleInvoicePdf(params: {
  invoiceNumber: string;
  sellerName: string;
  customerName: string;
  issuedAt: string;
  total: string;
  vatAmount: string;
  qrTlvBase64?: string;
}): Buffer {
  const lines = [
    'Suqya Invoice / فاتورة سقيا',
    `Invoice: ${params.invoiceNumber}`,
    `Seller: ${params.sellerName}`,
    `Customer: ${params.customerName}`,
    `Issued: ${params.issuedAt}`,
    `VAT: ${params.vatAmount} SAR`,
    `Total: ${params.total} SAR`,
    params.qrTlvBase64 ? `ZATCA-QR-TLV: ${params.qrTlvBase64}` : 'ZATCA-QR-TLV: (pending)',
  ];

  const contentLines = lines
    .map((line, i) => {
      const y = 750 - i * 22;
      const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      return `BT /F1 11 Tf 50 ${y} Td (${escaped}) Tj ET`;
    })
    .join('\n');

  const stream = `BT /F1 14 Tf 50 780 Td (Suqya) Tj ET\n${contentLines}`;
  const streamLen = Buffer.byteLength(stream, 'utf8');

  const objects: string[] = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objects.push(
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n',
  );
  objects.push(`4 0 obj<< /Length ${streamLen} >>stream\n${stream}\nendstream\nendobj\n`);
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xref = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xref}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}
