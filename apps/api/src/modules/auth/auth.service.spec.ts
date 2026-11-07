import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole } from '@prisma/client';
import { SMS_PROVIDER } from '../../integrations/sms/sms.types';
import { hashRefreshToken } from './token-hash';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    otpCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const sms = {
    name: 'sandbox' as const,
    sendOtp: jest.fn().mockResolvedValue({
      provider: 'sandbox',
      messageId: 'sandbox-1',
      debugCode: '123456',
    }),
    sendSms: jest.fn(),
  };

  const configValues: Record<string, string | undefined> = {
    NODE_ENV: 'development',
    OTP_MODE: 'sandbox',
    OTP_SANDBOX_CODE: '123456',
    OTP_EXPOSE_IN_RESPONSE: 'true',
  };

  const configGet = jest.fn((key: string) => configValues[key]);

  beforeEach(async () => {
    Object.assign(configValues, {
      NODE_ENV: 'development',
      OTP_MODE: 'sandbox',
      OTP_SANDBOX_CODE: '123456',
      OTP_EXPOSE_IN_RESPONSE: 'true',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        { provide: ConfigService, useValue: { get: configGet } },
        { provide: SMS_PROVIDER, useValue: sms },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
    prisma.otpCode.count.mockResolvedValue(0);
    prisma.session.create.mockResolvedValue({ id: 'sess-new' });
  });

  it('sends sandbox OTP without logging the code and exposes sandboxCode only in sandbox mode', async () => {
    prisma.otpCode.create.mockResolvedValue({});
    const result = await service.sendOtp({ phone: '+966501234567' }, 'default-tenant');
    expect(sms.sendOtp).toHaveBeenCalled();
    expect(result.provider).toBe('sandbox');
    expect(result.sandboxCode).toBe('123456');
    expect(result.mode).toBe('sandbox');
  });

  it('does not expose sandboxCode unless OTP_MODE is explicitly sandbox', async () => {
    configValues.OTP_MODE = 'auto';
    prisma.otpCode.create.mockResolvedValue({});
    const result = await service.sendOtp({ phone: '+966501234567' }, 'default-tenant');
    expect(result.mode).toBe('sandbox');
    expect(result).not.toHaveProperty('sandboxCode');
  });

  it('rate-limits OTP send after too many recent codes', async () => {
    prisma.otpCode.count.mockResolvedValue(5);
    await expect(
      service.sendOtp({ phone: '+966501234567' }, 'default-tenant'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(prisma.otpCode.create).not.toHaveBeenCalled();
  });

  it('rejects admin self-registration', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({
      id: '1',
      phone: '+966501234567',
      code: '123456',
      failedAttempts: 0,
    });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.verifyOtp(
        { phone: '+966501234567', code: '123456', role: UserRole.admin },
        'default-tenant',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('defaults new users to customer role', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({ id: '1', failedAttempts: 0 });
    prisma.otpCode.update.mockResolvedValue({});
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      phone: '+966501234567',
      role: UserRole.customer,
      profile: { nameAr: 'عميل' },
    });

    const result = await service.verifyOtp(
      { phone: '+966501234567', code: '123456' },
      'default-tenant',
    );

    expect(result.accessToken).toBe('token');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: UserRole.customer }),
      }),
    );
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          refreshTokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );
  });

  it('scopes OTP lookup to tenant', async () => {
    prisma.otpCode.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      service.verifyOtp(
        { phone: '+966501234567', code: '123456' },
        'default-tenant',
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(prisma.otpCode.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'default-tenant' }),
      }),
    );
  });

  it('records failed OTP attempts and burns the code at the limit', async () => {
    prisma.otpCode.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'otp-1',
        failedAttempts: 4,
      });
    prisma.otpCode.update.mockResolvedValue({});

    await expect(
      service.verifyOtp(
        { phone: '+966501234567', code: '000000' },
        'default-tenant',
      ),
    ).rejects.toThrow(UnauthorizedException);

    expect(prisma.otpCode.update).toHaveBeenCalledWith({
      where: { id: 'otp-1' },
      data: { failedAttempts: 5, used: true },
    });
  });

  it('refreshes via hashed token lookup and rotates the session', async () => {
    const raw = 'opaque-refresh-token-value';
    const hash = hashRefreshToken(raw);
    prisma.session.findUnique.mockResolvedValue({
      id: 'sess-old',
      refreshTokenHash: hash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'u1',
        tenantId: 'default-tenant',
        role: UserRole.customer,
        phone: '+966501234567',
        status: 'active',
      },
    });
    prisma.session.update.mockResolvedValue({});
    prisma.session.create.mockResolvedValue({ id: 'sess-new' });

    const result = await service.refreshToken(raw);

    expect(prisma.session.findUnique).toHaveBeenCalledWith({
      where: { refreshTokenHash: hash },
      include: { user: true },
    });
    expect(prisma.session.findMany).not.toHaveBeenCalled();
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'sess-old' },
      data: { revokedAt: expect.any(Date), replacedById: 'sess-new' },
    });
  });

  it('detects refresh token reuse and revokes all user sessions', async () => {
    const raw = 'stolen-refresh-token';
    prisma.session.findUnique.mockResolvedValue({
      id: 'sess-old',
      userId: 'u1',
      refreshTokenHash: hashRefreshToken(raw),
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 'u1',
        tenantId: 'default-tenant',
        role: UserRole.customer,
        phone: '+966501234567',
        status: 'active',
      },
    });
    prisma.session.updateMany.mockResolvedValue({ count: 2 });

    await expect(service.refreshToken(raw)).rejects.toThrow(
      /Refresh token reuse detected/,
    );
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('rejects unknown refresh tokens without scanning sessions', async () => {
    prisma.session.findUnique.mockResolvedValue(null);
    await expect(service.refreshToken('missing')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prisma.session.findMany).not.toHaveBeenCalled();
  });
});
