import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateDisputeDto {
  @ApiProperty() @IsString() orderId!: string;
  @ApiProperty() @IsString() reason!: string;
}

class ResolveDisputeDto {
  @ApiProperty() @IsString() resolution!: string;
}

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disputes')
export class DisputeController {
  constructor(private disputeService: DisputeService) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ summary: 'Raise order dispute' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDisputeDto) {
    return this.disputeService.create(dto.orderId, user.sub, dto.reason);
  }

  @Get()
  @Roles('admin', 'dispatcher')
  @ApiOperation({ summary: 'List disputes' })
  list(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.disputeService.list(user.tenantId, status);
  }

  @Patch(':id/resolve')
  @Roles('admin')
  @ApiOperation({ summary: 'Resolve dispute' })
  resolve(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(id, user.tenantId, dto.resolution);
  }
}
