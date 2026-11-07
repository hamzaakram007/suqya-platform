import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SandboxSmsProvider } from './sandbox-sms.provider';
import { UnifonicSmsProvider } from './unifonic-sms.provider';
import { SMS_PROVIDER, SmsProvider, isPlaceholderSecret } from './sms.types';

export function resolveSmsProvider(
  config: ConfigService,
  sandbox: SandboxSmsProvider,
  unifonic: UnifonicSmsProvider,
): SmsProvider {
  const mode = (config.get<string>('SMS_PROVIDER') ?? 'auto').toLowerCase();
  const appSid = config.get<string>('UNIFONIC_APP_SID');

  if (mode === 'unifonic' || (mode === 'auto' && !isPlaceholderSecret(appSid))) {
    return unifonic;
  }
  return sandbox;
}

@Global()
@Module({
  providers: [
    SandboxSmsProvider,
    UnifonicSmsProvider,
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService, SandboxSmsProvider, UnifonicSmsProvider],
      useFactory: resolveSmsProvider,
    },
  ],
  exports: [SMS_PROVIDER, SandboxSmsProvider, UnifonicSmsProvider],
})
export class SmsModule {}
