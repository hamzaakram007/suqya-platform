'use client';

import { SupplierLayout } from '@/components/SupplierLayout';
import { useRequireAuth } from '@/providers/auth-provider';
import { LoadingState } from '@/components/PageShell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useRequireAuth(['supplier']);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  return <SupplierLayout>{children}</SupplierLayout>;
}
