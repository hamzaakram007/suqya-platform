import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { DispatchService } from '../dispatch/dispatch.service';
import { OrderStateMachine } from '../order/order-state-machine';
import { OrderCompletionService } from '../order/order-completion.service';
import { FraudDetectionService } from '../security/security.service';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UpdateStatusDto {
  @ApiProperty() @IsBoolean() isOnline!: boolean;
}

class UpdateLocationDto {
  @ApiProperty() @IsNumber() latitude!: number;
  @ApiProperty() @IsNumber() longitude!: number;
}

class PodDto {
  @ApiPropertyOptional() @IsOptional() @IsString() photoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() signatureUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() otp?: string;
}

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
@Controller('drivers')
export class DriverController {
  constructor(
    private prisma: PrismaService,
    private dispatch: DispatchService,
    private stateMachine: OrderStateMachine,
    private orderCompletion: OrderCompletionService,
    private fraud: FraudDetectionService,
    @InjectQueue('dispatch') private dispatchQueue: Queue,
  ) {}

  @Patch('status')
  @ApiOperation({ summary: 'Toggle online/offline' })
  async updateStatus(@CurrentUser() user: JwtPayload, @Body() dto: UpdateStatusDto) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    return this.prisma.driver.update({
      where: { id: driver.id },
      data: { isOnline: dto.isOnline },
    });
  }

  @Post('location')
  @ApiOperation({ summary: 'Update driver GPS location' })
  async updateLocation(@CurrentUser() user: JwtPayload, @Body() dto: UpdateLocationDto) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    const fraudCheck = await this.fraud.checkGpsVelocity(
      driver.id,
      dto.latitude,
      dto.longitude,
    );
    if (fraudCheck.alert) {
      await this.prisma.fraudAlert.create({
        data: {
          tenantId: user.tenantId,
          entityType: 'driver',
          entityId: driver.id,
          alertType: fraudCheck.type ?? 'gps_spoof',
          message: fraudCheck.message ?? 'Suspicious GPS activity',
        },
      });
    }

    await this.prisma.$transaction([
      this.prisma.driver.update({
        where: { id: driver.id },
        data: { latitude: dto.latitude, longitude: dto.longitude },
      }),
      this.prisma.driverLocation.create({
        data: { driverId: driver.id, latitude: dto.latitude, longitude: dto.longitude },
      }),
    ]);

    return { updated: true };
  }

  @Post('jobs/:id/accept')
  @ApiOperation({ summary: 'Accept job offer' })
  async acceptJob(@CurrentUser() user: JwtPayload, @Param('id') orderId: string) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    await this.assertDriverAssigned(driver.id, orderId);
    return this.dispatch.acceptJob(driver.id, orderId);
  }

  @Post('jobs/:id/reject')
  @ApiOperation({ summary: 'Reject job offer' })
  async rejectJob(@CurrentUser() user: JwtPayload, @Param('id') orderId: string) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    await this.assertDriverAssigned(driver.id, orderId);
    return this.dispatch.rejectJob(driver.id, orderId);
  }

  @Post('jobs/:id/pod')
  @ApiOperation({ summary: 'Submit proof of delivery' })
  async submitPod(
    @CurrentUser() user: JwtPayload,
    @Param('id') orderId: string,
    @Body() dto: PodDto,
  ) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, driverId: driver.id },
    });
    if (!order) throw new ForbiddenException('Not assigned to this order');

    await this.prisma.proofOfDelivery.create({
      data: {
        orderId,
        photoUrl: dto.photoUrl,
        signatureUrl: dto.signatureUrl,
        otpVerified: !!dto.otp,
      },
    });

    await this.stateMachine.transition(this.prisma, orderId, 'delivered', driver.id);
    await this.stateMachine.transition(this.prisma, orderId, 'payment_pending');

    if (order.paymentType === 'cash' || order.paymentType === 'credit') {
      await this.stateMachine.transition(this.prisma, orderId, 'completed', driver.id);
      await this.orderCompletion.onOrderCompleted(orderId, user.tenantId);
    }

    return { message: 'Proof of delivery submitted' };
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Driver earnings history' })
  async earnings(@CurrentUser() user: JwtPayload) {
    const driver = await this.prisma.driver.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    const earnings = await this.prisma.driverEarning.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    return { total, earnings };
  }

  private async assertDriverAssigned(driverId: string, orderId: string) {
    const assignment = await this.prisma.orderAssignment.findFirst({
      where: { orderId, driverId, response: null },
    });
    if (!assignment) throw new NotFoundException('Job offer not found');
  }
}
