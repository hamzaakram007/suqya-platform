import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, CancelOrderDto, RateOrderDto } from './order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private orderService: OrderService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ summary: 'Create a new water delivery order' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.tenantId, user.sub, dto);
  }

  @Get()
  @Roles('customer')
  @ApiOperation({ summary: 'List customer orders' })
  list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.orderService.findByCustomer(user.sub, page, limit);
  }

  @Get(':id')
  @Roles('customer', 'driver', 'supplier', 'admin')
  @ApiOperation({ summary: 'Get order details' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.orderService.findById(id, user.sub);
  }

  @Get(':id/track')
  @ApiOperation({ summary: 'Live order tracking' })
  track(@Param('id') id: string) {
    return this.orderService.track(id);
  }

  @Patch(':id/cancel')
  @Roles('customer')
  @ApiOperation({ summary: 'Cancel order' })
  cancel(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orderService.cancel(id, user.sub, dto.reason);
  }

  @Post(':id/rate')
  @Roles('customer')
  @ApiOperation({ summary: 'Rate completed order' })
  async rate(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RateOrderDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId: user.sub, status: 'completed' },
    });
    if (!order?.driverId) throw new Error('Order not found or not rateable');

    return this.prisma.rating.create({
      data: {
        orderId: id,
        raterId: user.sub,
        ratedId: order.driverId,
        score: dto.score,
        comment: dto.comment,
      },
    });
  }
}
