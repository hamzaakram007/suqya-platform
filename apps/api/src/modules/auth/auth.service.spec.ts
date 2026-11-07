import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.module';
import { UserRole } from '@prisma/client';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('development') } },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
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
