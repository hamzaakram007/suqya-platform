import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreditPaymentDto {
  @ApiProperty() @IsNumber() @Min(1) amount!: number;
}

class ApplyCreditDto {
  @ApiProperty() @IsNumber() @Min(1000) requestedLimit!: number;
}

@ApiTags('Credit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('credit')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get('statement')
  @Roles('customer')
  @ApiOperation({ summary: 'Get credit account statement' })
  statement(@CurrentUser() user: JwtPayload) {
    return this.creditService.getStatement(user.sub);
  }

  @Post('apply')
  @Roles('customer')
  @ApiOperation({ summary: 'Apply for credit account' })
  apply(@CurrentUser() user: JwtPayload, @Body() dto: ApplyCreditDto) {
    return this.creditService.applyForCredit(user.sub, user.tenantId, dto.requestedLimit);
  }

  @Post('payments')
  @Roles('customer')
  @ApiOperation({ summary: 'Make credit payment' })
  payment(@CurrentUser() user: JwtPayload, @Body() dto: CreditPaymentDto) {
    return this.creditService.recordPayment(user.sub, dto.amount);
  }

  @Get('aging')
  @Roles('admin', 'supplier')
  @ApiOperation({ summary: 'Credit aging report' })
  aging(@CurrentUser() user: JwtPayload) {
    return this.creditService.getAgingReport(user.tenantId);
  }
}
