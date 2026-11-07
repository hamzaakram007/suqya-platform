import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SmsProvider, SmsSendResult } from './sms.types';

/**
 * Unifonic REST sender. Used when SMS_PROVIDER=unifonic and UNIFONIC_APP_SID is set.
 * Docs: https://docs.unifonic.com/
 */
@Injectable()
export class UnifonicSmsProvider implements SmsProvider {
  readonly name = 'unifonic' as const;
  private readonly logger = new Logger(UnifonicSmsProvider.name);

  constructor(private config: ConfigService) {}

  async sendOtp(phone: string, code: string, tenantId: string): Promise<SmsSendResult> {
    const body = `Suqya OTP: ${code}. Valid 5 minutes. (${tenantId})`;
    return this.sendSms(phone, body);
  }

  async sendSms(phone: string, body: string): Promise<SmsSendResult> {
    const appSid = this.config.get<string>('UNIFONIC_APP_SID');
    const baseUrl =
      this.config.get<string>('UNIFONIC_API_URL') ??
      'https://el.cloud.unifonic.com/rest/SMS/messages';
    const senderId = this.config.get<string>('UNIFONIC_SENDER_ID') ?? 'Suqya';

    if (!appSid) {
      throw new Error('UNIFONIC_APP_SID is required when SMS_PROVIDER=unifonic');
    }

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        AppSid: appSid,
        Recipient: phone.replace(/^\+/, ''),
        Body: body,
        SenderID: senderId,
      }),
    });

    const text = await res.text();
    if (!res.ok) {
      this.logger.error(`Unifonic SMS failed (${res.status}): ${text.slice(0, 200)}`);
      throw new Error(`Unifonic SMS failed with status ${res.status}`);
    }

    let messageId = `unifonic-${uuidv4()}`;
    try {
      const json = JSON.parse(text) as { data?: { MessageID?: string } };
      if (json?.data?.MessageID) messageId = String(json.data.MessageID);
    } catch {
      /* keep generated id */
    }

    this.logger.log(`[unifonic] SMS accepted messageId=${messageId}`);
    return { provider: 'unifonic', messageId };
  }
}
