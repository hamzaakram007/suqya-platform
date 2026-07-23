import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notifications: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications with locale-resolved template copy' })
  list(
    @CurrentUser() user: JwtPayload,
    @Locale() locale: AppLocale,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notifications.getForUser(user.sub, page ?? 1, limit ?? 20, locale);
  }
}
