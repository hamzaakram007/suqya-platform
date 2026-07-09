import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سقيا - لوحة الإدارة',
  description: 'Suqya Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
