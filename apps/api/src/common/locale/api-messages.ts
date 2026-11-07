import { AppLocale } from './locale.types';

const messages = {
  ar: {
    'validation.failed': 'بيانات غير صالحة',
    'auth.unauthorized': 'غير مصرح',
    'auth.forbidden': 'غير مسموح',
    'not_found': 'غير موجود',
    'tenant.required': 'معرف المستأجر مطلوب',
    'tenant.invalid': 'مستأجر غير صالح أو غير نشط',
    'order.not_found': 'الطلب غير موجود',
    'generic.error': 'حدث خطأ، حاول مرة أخرى',
  },
  en: {
    'validation.failed': 'Invalid request data',
    'auth.unauthorized': 'Unauthorized',
    'auth.forbidden': 'Forbidden',
    'not_found': 'Not found',
    'tenant.required': 'Tenant ID is required',
    'tenant.invalid': 'Invalid or inactive tenant',
    'order.not_found': 'Order not found',
    'generic.error': 'Something went wrong, please try again',
  },
} as const;

export type ApiMessageKey = keyof typeof messages.ar;

export function apiMessage(key: ApiMessageKey, locale: AppLocale = 'ar'): string {
  return messages[locale][key] ?? messages.ar[key];
}
