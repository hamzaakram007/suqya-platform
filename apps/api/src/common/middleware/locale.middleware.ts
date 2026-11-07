import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.module';
import { AppLocale, DEFAULT_LOCALE } from '../locale/locale.types';
import { normalizeLocale, parseAcceptLanguage } from '../locale/locale.util';
import '../locale/locale.types';

/**
 * Locale resolution order:
 * 1. Accept-Language header
 * 2. Authenticated user's preferredLanguage (if JWT already attached)
 * 3. Default `ar`
 */
@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const fromHeader = parseAcceptLanguage(req.headers['accept-language']);
    if (fromHeader) {
      req.locale = fromHeader;
      return next();
    }

    const userId = (req as Request & { user?: { sub?: string } }).user?.sub;
    if (userId) {
      try {
        const profile = await this.prisma.userProfile.findUnique({
          where: { userId },
          select: { preferredLanguage: true },
        });
        req.locale = normalizeLocale(profile?.preferredLanguage);
        return next();
      } catch {
        // fall through
      }
    }

    req.locale = DEFAULT_LOCALE;
    next();
  }
}

export function getRequestLocale(req: Request): AppLocale {
  return req.locale ?? DEFAULT_LOCALE;
}
