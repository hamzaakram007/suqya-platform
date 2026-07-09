import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoiceService, ZatcaService } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
    private zatcaService: ZatcaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List customer invoices' })
  list(@CurrentUser() user: JwtPayload) {
    return this.invoiceService.findByCustomer(user.sub);
  }

  @Post('zatca/submit/:invoiceId')
  @ApiOperation({ summary: 'Submit invoice to ZATCA Fatoora' })
  submit(@Param('invoiceId') invoiceId: string) {
    return this.zatcaService.submitToFatoora(invoiceId);
  }
}
