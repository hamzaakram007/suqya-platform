import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionService, LoyaltyService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SubscribeDto {
  @ApiProperty() @IsUUID() planId!: string;
}

class ReferralDto {
  @ApiProperty() @IsString() phone!: string;
}

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private subscriptionService: SubscriptionService,
    private loyaltyService: LoyaltyService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'List subscription plans' })
  plans(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.listPlans(user.tenantId);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to plan' })
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto) {
    return this.subscriptionService.subscribe(user.sub, user.tenantId, dto.planId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get active subscription' })
  me(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.getActive(user.sub);
  }

  @Get('loyalty')
  @ApiOperation({ summary: 'Loyalty points balance' })
  loyalty(@CurrentUser() user: JwtPayload) {
    return this.loyaltyService.getBalance(user.sub);
  }

  @Post('referrals')
  @ApiOperation({ summary: 'Create referral' })
  referral(@CurrentUser() user: JwtPayload, @Body() dto: ReferralDto) {
    return this.loyaltyService.createReferral(user.sub, dto.phone);
  }
}
