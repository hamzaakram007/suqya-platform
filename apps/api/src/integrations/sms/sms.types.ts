export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

export interface SmsSendResult {
  provider: 'sandbox' | 'unifonic';
  messageId: string;
  /** Present only when OTP_EXPOSE_IN_RESPONSE=true (local/staging E2E). */
  debugCode?: string;
}

export interface SmsProvider {
  readonly name: 'sandbox' | 'unifonic';
  sendOtp(phone: string, code: string, tenantId: string): Promise<SmsSendResult>;
  sendSms(phone: string, body: string): Promise<SmsSendResult>;
}

export function isPlaceholderSecret(value: string | undefined | null): boolean {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  return (
    v.length === 0 ||
    v.includes('placeholder') ||
    v === 'changeme' ||
    v === 'your-key-here'
  );
}
