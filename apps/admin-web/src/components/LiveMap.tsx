'use client';

import { useTranslations } from 'next-intl';
import { MapShell, Card, CardContent } from '@suqya/ui-kit';

export function LiveMap({
  className,
  fullBleed = false,
}: {
  className?: string;
  fullBleed?: boolean;
}) {
  const t = useTranslations();

  return (
    <MapShell
      className={
        fullBleed
          ? `min-h-[min(72vh,640px)] rounded-none border-0 ${className ?? ''}`
          : `min-h-[420px] ${className ?? ''}`
      }
      overlay={
        <Card className="bg-[var(--sq-surface)]/95 backdrop-blur-sm shadow-[var(--sq-shadow-md)]">
          <CardContent className="space-y-2 p-0">
            <div className="flex items-center gap-2">
              <span className="sq-live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--sq-primary)]" />
              <p className="text-sm font-semibold text-[var(--sq-text)]">{t('live_stream')}</p>
            </div>
            <p className="text-xs text-[var(--sq-text-secondary)]">{t('live_map_desc')}</p>
          </CardContent>
        </Card>
      }
    >
      <div className="relative z-[1] flex h-full min-h-[inherit] flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="grid grid-cols-3 gap-6 opacity-80">
          {[
            { top: '28%', right: '22%' },
            { top: '48%', right: '55%' },
            { top: '62%', right: '35%' },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute h-3.5 w-3.5 rounded-full bg-[var(--sq-primary)] shadow-[var(--sq-shadow-fab)]"
              style={{ top: pos.top, right: pos.right }}
            />
          ))}
        </div>
        <p className="text-lg font-bold text-[var(--sq-primary)]">{t('ops_map_title')}</p>
        <p className="max-w-sm text-sm text-[var(--sq-text-secondary)]">{t('ops_map_desc')}</p>
      </div>
    </MapShell>
  );
}
