import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { FaqService } from './faq.service';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';

@ApiTags('FAQ')
@Controller('faqs')
export class FaqController {
  constructor(private faqService: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'List bilingual FAQs resolved for locale' })
  @ApiHeader({ name: 'Accept-Language', required: false })
  @ApiHeader({ name: 'X-Tenant-Id', required: false })
  @ApiQuery({ name: 'category', required: false })
  list(
    @Locale() locale: AppLocale,
    @Req() req: Request,
    @Query('category') category?: string,
  ) {
    return this.faqService.list(req.tenantId, locale, category);
  }
}
