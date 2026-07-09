import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService, ZatcaService } from './invoice.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, ZatcaService],
  exports: [InvoiceService, ZatcaService],
})
export class InvoiceModule {}
