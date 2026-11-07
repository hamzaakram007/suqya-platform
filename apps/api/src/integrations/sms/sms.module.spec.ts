import { ConfigService } from '@nestjs/config';
import { resolveSmsProvider } from './sms.module';
import { SandboxSmsProvider } from './sandbox-sms.provider';
import { UnifonicSmsProvider } from './unifonic-sms.provider';

describe('resolveSmsProvider', () => {
  const sandbox = { name: 'sandbox' } as SandboxSmsProvider;
  const unifonic = { name: 'unifonic' } as UnifonicSmsProvider;

  it('defaults to sandbox when Unifonic sid is placeholder', () => {
    const config = {
      get: (k: string) =>
        k === 'SMS_PROVIDER' ? 'auto' : k === 'UNIFONIC_APP_SID' ? 'placeholder' : undefined,
    } as ConfigService;
    expect(resolveSmsProvider(config, sandbox, unifonic).name).toBe('sandbox');
  });

  it('selects unifonic when forced', () => {
    const config = {
      get: (k: string) => (k === 'SMS_PROVIDER' ? 'unifonic' : 'real-sid'),
    } as ConfigService;
    expect(resolveSmsProvider(config, sandbox, unifonic).name).toBe('unifonic');
  });
});
