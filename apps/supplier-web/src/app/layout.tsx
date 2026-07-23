import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { LocaleProvider } from '@/providers/locale-provider';
import { LocaleScript } from '@/components/LocaleScript';

export const metadata: Metadata = {
  title: 'Suqya — Supplier Portal',
  description: 'Suqya Supplier Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <LocaleScript />
      </head>
      <body>
        <LocaleProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
