'use client';

import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/providers/auth-provider';
import { LoadingState } from '@/components/PageShell';

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useRequireAuth(['admin', 'dispatcher']);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
