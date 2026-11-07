import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.module';
import { resolveJwtSecrets } from '../config/jwt-secret';
import { verifyAccessToken } from '../auth/verify-access-token';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  phone: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const secrets = resolveJwtSecrets({
        JWT_SECRET: this.config.get<string>('JWT_SECRET'),
        JWT_SECRET_PREVIOUS: this.config.get<string>('JWT_SECRET_PREVIOUS'),
        NODE_ENV: this.config.get<string>('NODE_ENV'),
        APP_ENV: this.config.get<string>('APP_ENV'),
        REQUIRE_STRONG_JWT: this.config.get<string>('REQUIRE_STRONG_JWT'),
      });
      const payload = verifyAccessToken(this.jwtService, token, secrets);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, status: true, tenantId: true },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Account inactive or not found');
      }

      if (user.tenantId !== payload.tenantId) {
        throw new UnauthorizedException('Invalid tenant context');
      }

      (request as Request & { user: JwtPayload }).user = payload;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
