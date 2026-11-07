import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { HealthModule } from './modules/health/health.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { DisputeModule } from './modules/dispute/dispute.module';
import { SupportModule } from './modules/support/support.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SecurityModule } from './modules/security/security.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ErpModule } from './modules/erp/erp.module';
import { FaqModule } from './modules/faq/faq.module';
import { TrackingGateway } from './gateways/tracking.gateway';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { LocaleMiddleware } from './common/middleware/locale.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 10 },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    PrismaModule,
    HealthModule,
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
    WalletModule,
    CouponModule,
    SettlementModule,
    DisputeModule,
    SupportModule,
    AnalyticsModule,
    SecurityModule,
    SubscriptionModule,
    ErpModule,
    FaqModule,
  ],
  providers: [
    TrackingGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LocaleMiddleware).forRoutes('*');
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/(.*)', method: RequestMethod.ALL },
        { path: 'payments/webhook', method: RequestMethod.POST },
        { path: 'faqs', method: RequestMethod.GET },
        { path: 'faqs/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
