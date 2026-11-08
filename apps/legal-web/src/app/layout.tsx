import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'سقيا — الخصوصية والدعم',
    template: '%s · سقيا',
  },
  description: 'سياسة الخصوصية وصفحة الدعم لتطبيقات سقيا (PDPL).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
