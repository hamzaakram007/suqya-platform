import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    tenantId: string,
    action: string,
    entityType: string,
    entityId?: string,
    userId?: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(tenantId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, meta: { page, limit, total } };
  }
}

@Injectable()
export class TwoFactorService {
  private secrets = new Map<string, string>();

  generateSecret(userId: string): { secret: string; otpauthUrl: string } {
    const secret = crypto.randomBytes(20).toString('hex');
    this.secrets.set(userId, secret);
    return {
      secret,
      otpauthUrl: `otpauth://totp/Suqya:${userId}?secret=${secret}&issuer=Suqya`,
    };
  }

  verify(userId: string, token: string): boolean {
    const secret = this.secrets.get(userId);
    if (!secret) return false;
    // Simplified TOTP — production should use otplib
    const expected = crypto.createHmac('sha1', secret).update(Math.floor(Date.now() / 30000).toString()).digest('hex').slice(0, 6);
    return token === expected;
  }
}

@Injectable()
export class PdplService {
  constructor(private prisma: PrismaService) {}

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        profile: true,
        addresses: true,
        orders: true,
        notifications: { take: 100 },
        wallet: { include: { ledger: true } },
      },
    });
    return { exportedAt: new Date().toISOString(), user };
  }

  async requestDeletion(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'inactive', phone: `deleted_${userId}` },
    });
    return { message: 'Deletion request recorded', userId };
  }
}

@Injectable()
export class FraudDetectionService {
  constructor(private prisma: PrismaService) {}

  async checkGpsVelocity(driverId: string, lat: number, lng: number) {
    const last = await this.prisma.driverLocation.findFirst({
      where: { driverId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!last?.latitude || !last?.longitude) return { alert: false };

    const distance = this.haversine(last.latitude, last.longitude, lat, lng);
    const timeDiff =
      (Date.now() - last.recordedAt.getTime()) / 1000 / 3600;
    const speedKmh = timeDiff > 0 ? distance / timeDiff : 0;

    if (speedKmh > 200) {
      return {
        alert: true,
        type: 'gps_spoof',
        message: `Impossible speed: ${speedKmh.toFixed(0)} km/h`,
      };
    }
    return { alert: false };
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
