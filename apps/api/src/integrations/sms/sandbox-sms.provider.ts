import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SmsProvider, SmsSendResult } from './sms.types';

/**
 * Honest local/staging SMS: persists nothing beyond OTP rows, never calls a network.
 * Fixed codes via OTP_SANDBOX_CODE (default 123456) when AuthService uses sandbox mode.
 * Never logs the OTP code. debugCode is returned only when OTP_MODE=sandbox and
 * OTP_EXPOSE_IN_RESPONSE=true.
 */
@Injectable()
export class SandboxSmsProvider implements SmsProvider {
  readonly name = 'sandbox' as const;
  private readonly logger = new Logger(SandboxSmsProvider.name);

  constructor(private config: ConfigService) {}

  async sendOtp(phone: string, code: string, tenantId: string): Promise<SmsSendResult> {
    const messageId = `sandbox-otp-${uuidv4()}`;
    this.logger.log(
      `[sandbox-sms] OTP queued for ${phone}@${tenantId} messageId=${messageId}`,
    );

    const mode = (this.config.get<string>('OTP_MODE') ?? 'auto').toLowerCase();
    const expose =
      (mode === 'sandbox' || mode === 'dev') &&
      this.config.get('OTP_EXPOSE_IN_RESPONSE') === 'true';

    return {
      provider: 'sandbox',
      messageId,
      ...(expose ? { debugCode: code } : {}),
    };
  }

  async sendSms(phone: string, body: string): Promise<SmsSendResult> {
    const messageId = `sandbox-sms-${uuidv4()}`;
    this.logger.log(
      `[sandbox-sms] SMS to ${phone} messageId=${messageId} len=${body.length}`,
    );
    return { provider: 'sandbox', messageId };
  }
}
