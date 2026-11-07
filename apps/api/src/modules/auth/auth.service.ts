import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole, UserStatus } from '@prisma/client';
import { SendOtpDto, VerifyOtpDto } from './auth.dto';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { SELF_REGISTER_ROLES } from '../../common/constants/roles';
import { SMS_PROVIDER, SmsProvider } from '../../integrations/sms/sms.types';
import { generateRefreshToken, hashRefreshToken } from './token-hash';

/** Max OTP send requests per phone+tenant inside the sliding window. */
const OTP_SEND_LIMIT = 5;
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000;

/** Max wrong guesses against a single active OTP before it is burned. */
const OTP_MAX_FAILED_ATTEMPTS = 5;

/** Refresh token lifetime (aligned with security policy). */
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    @Inject(SMS_PROVIDER) private sms: SmsProvider,
  ) {}

  /**
   * OTP mode:
   * - OTP_MODE=sandbox → fixed OTP_SANDBOX_CODE (default 123456)
   * - OTP_MODE=live → random 6-digit via SMS provider
   * - OTP_MODE=auto → sandbox outside production / when SMS provider is sandbox
   */
  private resolveOtpCode(): { code: string; mode: 'sandbox' | 'live' } {
    const forced = (this.config.get<string>('OTP_MODE') ?? 'auto').toLowerCase();
    const nodeEnv = this.config.get<string>('NODE_ENV') ?? 'development';
    const sandboxCode = this.config.get<string>('OTP_SANDBOX_CODE') ?? '123456';

    if (forced === 'sandbox' || forced === 'dev') {
      return { code: sandboxCode, mode: 'sandbox' };
    }
    if (forced === 'live') {
      return {
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        mode: 'live',
      };
    }
    if (nodeEnv !== 'production' || this.sms.name === 'sandbox') {
      return { code: sandboxCode, mode: 'sandbox' };
    }
    return {
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      mode: 'live',
    };
  }

  /**
   * Sandbox codes may appear in API responses only when OTP_MODE is explicitly
   * `sandbox` and OTP_EXPOSE_IN_RESPONSE=true. Never in live mode; never logged.
   */
  private shouldExposeSandboxCode(mode: 'sandbox' | 'live'): boolean {
    if (mode !== 'sandbox') return false;
    const forced = (this.config.get<string>('OTP_MODE') ?? 'auto').toLowerCase();
    if (forced !== 'sandbox' && forced !== 'dev') return false;
    return this.config.get('OTP_EXPOSE_IN_RESPONSE') === 'true';
  }

  private async assertOtpSendAllowed(phone: string, tenantId: string) {
    const since = new Date(Date.now() - OTP_SEND_WINDOW_MS);
    const count = await this.prisma.otpCode.count({
      where: { phone, tenantId, createdAt: { gt: since } },
    });
    if (count >= OTP_SEND_LIMIT) {
      throw new HttpException(
        'Too many OTP requests. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async sendOtp(dto: SendOtpDto, tenantId: string) {
    await this.assertOtpSendAllowed(dto.phone, tenantId);

    const { code, mode } = this.resolveOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone: dto.phone, code, expiresAt, tenantId },
    });

    const sent = await this.sms.sendOtp(dto.phone, code, tenantId);
    // Never log the OTP code — only provider/mode/phone metadata.
    this.logger.log(
      `OTP sent via ${sent.provider} mode=${mode} phone=${dto.phone} messageId=${sent.messageId}`,
    );

    return {
      message: 'OTP sent successfully',
      expiresIn: 300,
      provider: sent.provider,
      mode,
      messageId: sent.messageId,
      ...(this.shouldExposeSandboxCode(mode) ? { sandboxCode: code } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto, tenantId: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        phone: dto.phone,
        tenantId,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
        failedAttempts: { lt: OTP_MAX_FAILED_ATTEMPTS },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      await this.recordFailedOtpAttempt(dto.phone, tenantId);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    let user = await this.prisma.user.findUnique({
      where: { tenantId_phone: { tenantId, phone: dto.phone } },
      include: { profile: true },
    });

    if (!user) {
      const role = dto.role ?? UserRole.customer;
      if (!SELF_REGISTER_ROLES.includes(role)) {
        throw new BadRequestException(
          'Admin and dispatcher roles require invitation',
        );
      }

      user = await this.prisma.user.create({
        data: {
          tenantId,
          phone: dto.phone,
          role,
          status: UserStatus.active,
          profile: { create: { preferredLanguage: 'ar' } },
        },
        include: { profile: true },
      });
    }

    const tokens = await this.generateTokens(
      user.id,
      tenantId,
      user.role,
      user.phone,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.profile?.nameAr ?? user.profile?.nameEn,
      },
    };
  }

  /** Increment failedAttempts on the newest active OTP; burn after limit. */
  private async recordFailedOtpAttempt(phone: string, tenantId: string) {
    const active = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        tenantId,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!active) return;

    const failedAttempts = active.failedAttempts + 1;
    await this.prisma.otpCode.update({
      where: { id: active.id },
      data: {
        failedAttempts,
        ...(failedAttempts >= OTP_MAX_FAILED_ATTEMPTS ? { used: true } : {}),
      },
    });
  }

  /**
   * Rotate refresh tokens via SHA-256 indexed lookup.
   * Reuse of a revoked token revokes all sessions for that user.
   */
  async refreshToken(refreshToken: string) {
    const lookupHash = hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: lookupHash },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.logger.warn(
        `Refresh token reuse detected; revoked all sessions for userId=${session.userId}`,
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (session.expiresAt <= new Date()) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = session.user;
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account inactive');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.tenantId,
      user.role,
      user.phone,
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        replacedById: tokens.sessionId,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(
    userId: string,
    tenantId: string,
    role: string,
    phone: string,
  ) {
    const payload: JwtPayload = { sub: userId, tenantId, role, phone };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return { accessToken, refreshToken, sessionId: session.id };
  }
}
