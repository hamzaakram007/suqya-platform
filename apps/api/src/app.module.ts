import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { OrderModule } from './modules/order/order.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { PaymentModule } from './modules/payment/payment.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { CreditModule } from './modules/credit/credit.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { DriverModule } from './modules/driver/driver.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { TrackingGateway } from './gateways/tracking.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    PrismaModule,
    AuthModule,
    TenantModule,
    CatalogModule,
    CustomerModule,
    OrderModule,
    DispatchModule,
    DriverModule,
    SupplierModule,
    PaymentModule,
    InvoiceModule,
    AccountingModule,
    CreditModule,
    NotificationModule,
    AdminModule,
  ],
  providers: [TrackingGateway],
})
export class AppModule {}
