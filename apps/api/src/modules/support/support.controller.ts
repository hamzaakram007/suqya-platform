import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateTicketDto {
  @ApiProperty() @IsString() subject!: string;
  @ApiProperty() @IsString() message!: string;
}

class ReplyDto {
  @ApiProperty() @IsString() body!: string;
}

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(user.tenantId, user.sub, dto.subject, dto.message);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List my tickets or all (admin)' })
  list(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    if (['admin', 'dispatcher'].includes(user.role)) {
      return this.supportService.listForTenant(user.tenantId, status);
    }
    return this.supportService.listForUser(user.sub);
  }

  @Post('tickets/:id/reply')
  @ApiOperation({ summary: 'Reply to ticket' })
  reply(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: ReplyDto) {
    return this.supportService.reply(id, user.sub, dto.body);
  }

  @Patch('tickets/:id/status')
  @Roles('admin', 'dispatcher')
  @ApiOperation({ summary: 'Update ticket status' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.supportService.updateStatus(id, user.tenantId, status);
  }
}
