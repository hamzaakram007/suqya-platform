import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService, ZatcaService } from './invoice.service';
import { DocumentTemplateService } from './document-template.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, ZatcaService, DocumentTemplateService],
  exports: [InvoiceService, ZatcaService, DocumentTemplateService],
})
export class InvoiceModule {}
