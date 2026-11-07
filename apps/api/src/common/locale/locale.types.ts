export type AppLocale = 'ar' | 'en';

export const DEFAULT_LOCALE: AppLocale = 'ar';

declare global {
  namespace Express {
    interface Request {
      locale?: AppLocale;
      tenantId?: string;
    }
  }
}

export {};
