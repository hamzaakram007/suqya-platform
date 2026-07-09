import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DispatchModule } from '../dispatch/dispatch.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [DispatchModule, OrderModule],
  controllers: [DriverController],
})
export class DriverModule {}
