import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Render invoice/receipt document (ar | en | bilingual)' })
  @ApiQuery({ name: 'layout', required: false, enum: ['ar', 'en', 'bilingual'] })
  document(
    @Param('id') id: string,
    @Query('layout') layout: DocumentLayout = 'bilingual',
    @Locale() locale: AppLocale,
  ) {
    return this.documents.renderInvoice(id, layout, locale);
  }

  @Post('zatca/submit/:invoiceId')
  @ApiOperation({ summary: 'Submit invoice to ZATCA Fatoora' })
  submit(@Param('invoiceId') invoiceId: string) {
    return this.zatcaService.submitToFatoora(invoiceId);
  }
}
