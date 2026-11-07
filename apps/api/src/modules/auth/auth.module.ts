import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SmsModule } from '../../integrations/sms/sms.module';
import { assertJwtSecret } from '../../common/config/jwt-secret';

@Global()
@Module({
  imports: [
    PrismaModule,
    SmsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // assertJwtSecret reads process.env; ConfigService mirrors it at boot.
        secret: assertJwtSecret({
          JWT_SECRET: config.get<string>('JWT_SECRET'),
          NODE_ENV: config.get<string>('NODE_ENV'),
          APP_ENV: config.get<string>('APP_ENV'),
          REQUIRE_STRONG_JWT: config.get<string>('REQUIRE_STRONG_JWT'),
        }),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
