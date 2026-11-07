import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SmsProvider, SmsSendResult } from './sms.types';

/**
 * Honest local/staging SMS: persists nothing beyond OTP rows, never calls a network.
 * Fixed codes via OTP_SANDBOX_CODE (default 123456) when AuthService uses sandbox mode.
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
    // Never print the code in logs — E2E uses OTP_SANDBOX_CODE / OTP_EXPOSE_IN_RESPONSE.
    const expose = this.config.get('OTP_EXPOSE_IN_RESPONSE') === 'true';
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
