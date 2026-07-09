import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [DispatchModule],
  controllers: [SupplierController],
})
export class SupplierModule {}
