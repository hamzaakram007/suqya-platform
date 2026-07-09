import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole, UserStatus } from '@prisma/client';
import { SendOtpDto, VerifyOtpDto } from './auth.dto';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto, tenantId: string) {
    const code = this.config.get('NODE_ENV') === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone: dto.phone, code, expiresAt },
    });

    // TODO: Send via Unifonic/Msegat in production
    console.log(`[OTP] ${dto.phone}: ${code}`);

    return { message: 'OTP sent successfully', expiresIn: 300 };
  }

  async verifyOtp(dto: VerifyOtpDto, tenantId: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        phone: dto.phone,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
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
      user = await this.prisma.user.create({
        data: {
          tenantId,
          phone: dto.phone,
          role: dto.role as UserRole,
          status: UserStatus.active,
          profile: { create: { preferredLanguage: 'ar' } },
        },
        include: { profile: true },
      });
    }

    const tokens = await this.generateTokens(user.id, tenantId, user.role, user.phone);

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

  async refreshToken(refreshToken: string) {
    const sessions = await this.prisma.session.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    let validSession = null;
    for (const session of sessions) {
      if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = validSession.user;
    return this.generateTokens(user.id, user.tenantId, user.role, user.phone);
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

    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
