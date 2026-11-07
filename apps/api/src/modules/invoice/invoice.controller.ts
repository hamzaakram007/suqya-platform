import { Controller, Get, Post, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoiceService, ZatcaService } from './invoice.service';
import { DocumentTemplateService, DocumentLayout } from './document-template.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private zatcaService: ZatcaService,
    private documents: DocumentTemplateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List customer invoices' })
  list(@CurrentUser() user: JwtPayload) {
    return this.invoiceService.findByCustomer(user.sub);
  }

  @Get(':id/document')
  @ApiOperation({ summary: 'Render invoice/receipt document (ar | en | bilingual) + ZATCA QR TLV' })
  @ApiQuery({ name: 'layout', required: false, enum: ['ar', 'en', 'bilingual'] })
  document(
    @Param('id') id: string,
    @Query('layout') layout: DocumentLayout = 'bilingual',
    @Locale() locale: AppLocale,
  ) {
    return this.documents.renderInvoice(id, layout, locale);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download B2C invoice PDF (includes ZATCA TLV QR payload)' })
  async pdf(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const invoice = await this.invoiceService.getPdf(id, user.tenantId);
    const dataUri = invoice.pdfUrl ?? '';
    const base64 = dataUri.startsWith('data:application/pdf;base64,')
      ? dataUri.slice('data:application/pdf;base64,'.length)
      : '';
    const buf = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    );
    res.send(buf);
  }

  @Post('zatca/submit/:invoiceId')
  @ApiOperation({ summary: 'Submit invoice to ZATCA Fatoora' })
  submit(@Param('invoiceId') invoiceId: string) {
    return this.zatcaService.submitToFatoora(invoiceId);
  }
}
