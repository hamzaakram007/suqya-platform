import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole } from '@prisma/client';
import { SMS_PROVIDER } from '../../integrations/sms/sms.types';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    otpCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findMany: jest.fn(),
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

  const configGet = jest.fn((key: string) => {
    if (key === 'NODE_ENV') return 'development';
    if (key === 'OTP_MODE') return 'sandbox';
    if (key === 'OTP_SANDBOX_CODE') return '123456';
    if (key === 'OTP_EXPOSE_IN_RESPONSE') return 'true';
    return undefined;
  });

  beforeEach(async () => {
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
  });

  it('sends sandbox OTP without console-only stub', async () => {
    prisma.otpCode.create.mockResolvedValue({});
    const result = await service.sendOtp({ phone: '+966501234567' }, 'default-tenant');
    expect(sms.sendOtp).toHaveBeenCalled();
    expect(result.provider).toBe('sandbox');
    expect(result.sandboxCode).toBe('123456');
    expect(result.mode).toBe('sandbox');
  });

  it('rejects admin self-registration', async () => {
    prisma.otpCode.findFirst.mockResolvedValue({
      id: '1',
      phone: '+966501234567',
      code: '123456',
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
    prisma.otpCode.findFirst.mockResolvedValue({ id: '1' });
    prisma.otpCode.update.mockResolvedValue({});
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      phone: '+966501234567',
      role: UserRole.customer,
      profile: { nameAr: 'عميل' },
    });
    prisma.session.create.mockResolvedValue({});

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
  });

  it('scopes OTP lookup to tenant', async () => {
    prisma.otpCode.findFirst.mockResolvedValue(null);

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
});
