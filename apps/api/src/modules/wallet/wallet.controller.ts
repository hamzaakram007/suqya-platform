import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class TopUpDto {
  @ApiProperty() @IsNumber() @Min(1) amount!: number;
}

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet balance and recent ledger' })
  get(@CurrentUser() user: JwtPayload) {
    return this.walletService.getOrCreate(user.sub);
  }

  @Post('topup')
  @ApiOperation({ summary: 'Top up wallet' })
  topUp(@CurrentUser() user: JwtPayload, @Body() dto: TopUpDto) {
    return this.walletService.topUp(user.sub, dto.amount);
  }
}
