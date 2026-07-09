import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import { DriverCandidate } from './dispatch.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dispatch')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dispatch')
export class DispatchController {
  constructor(private dispatchService: DispatchService) {}

  @Get('nearby-drivers')
  @Roles('admin', 'supplier', 'dispatcher')
  @ApiOperation({ summary: 'Find nearby available drivers' })
  findNearby(
    @CurrentUser() user: JwtPayload,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('capacity') capacity: number,
  ): Promise<DriverCandidate[]> {
    return this.dispatchService.findNearbyDrivers(
      user.tenantId,
      Number(lat),
      Number(lng),
      Number(capacity),
    );
  }

  @Post('assign/:orderId')
  @Roles('admin', 'supplier', 'dispatcher')
  @ApiOperation({ summary: 'Manually trigger driver assignment' })
  assign(@CurrentUser() user: JwtPayload, @Param('orderId') orderId: string) {
    return this.dispatchService.assignDriver(user.tenantId, orderId);
  }
}
