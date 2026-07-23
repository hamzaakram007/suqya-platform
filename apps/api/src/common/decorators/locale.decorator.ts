import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AppLocale, DEFAULT_LOCALE } from '../locale/locale.types';

export const Locale = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppLocale => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.locale ?? DEFAULT_LOCALE;
  },
);
