import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      (req as Request & { user?: { tenantId: string } }).user?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new BadRequestException('Invalid or inactive tenant');
    }

    (req as Request & { tenantId: string }).tenantId = tenantId;
    next();
  }
}
