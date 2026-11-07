'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Card, CardContent, Input } from '@suqya/ui-kit';
import { sendOtp, verifyOtp } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { setSession } = useAuth();
  const [phone, setPhone] = useState('+9665');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('otp_send_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await verifyOtp(phone, code);
      if (session.user.role !== 'admin' && session.user.role !== 'dispatcher') {
        setError(t('unauthorized_admin'));
        return;
      }
      setSession(session);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('otp_invalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute end-4 top-4 z-20">
        <LanguageSwitcher compact />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 10%, var(--sq-primary-muted), transparent 55%), radial-gradient(ellipse 60% 50% at 10% 90%, var(--sq-accent-muted), transparent 50%), linear-gradient(165deg, #eef6f6 0%, var(--sq-bg) 45%, #e4efef 100%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,var(--sq-border)_1px,transparent_0)] [background-size:28px_28px]" />

      <div className="relative z-10 w-full max-w-md sq-fade-up">
        <div className="mb-8 text-center">
          <p className="text-5xl font-bold tracking-tight text-[var(--sq-primary)] md:text-6xl">
            {t('app_name')}
          </p>
          <p className="mt-3 text-base text-[var(--sq-text-secondary)]">{t('login_admin_subtitle')}</p>
        </div>

        <Card className="shadow-[var(--sq-shadow-lg)]">
          <CardContent className="space-y-5 pt-2">
            <h1 className="text-xl font-bold text-[var(--sq-text)]">{t('login')}</h1>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label={t('phone_label')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9665XXXXXXXX"
                  dir="ltr"
                  required
                />
                {error && <p className="text-sm text-[var(--sq-error)]">{error}</p>}
                <Button type="submit" className="w-full" loading={loading}>
                  {t('send_otp')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-[var(--sq-text-secondary)]">
                  {t('otp_sent_to', { phone })}
                </p>
                <Input
                  label={t('otp_title')}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  dir="ltr"
                  maxLength={6}
                  required
                />
                {error && <p className="text-sm text-[var(--sq-error)]">{error}</p>}
                <Button type="submit" className="w-full" loading={loading}>
                  {t('enter_command_center')}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('phone')}>
                  {t('change_phone')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
