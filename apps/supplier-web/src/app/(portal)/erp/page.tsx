'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
} from '@suqya/ui-kit';

type ErpTab = 'fuel' | 'inventory' | 'employees';

export default function ErpPage() {
  const t = useTranslations();
  const [tab, setTab] = useState<ErpTab>('fuel');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const queryClient = useQueryClient();

  const inventory = useQuery({
    queryKey: ['erp', 'inventory'],
    queryFn: () => apiFetch<unknown[]>('/erp/inventory'),
    enabled: tab === 'inventory',
  });
  const employees = useQuery({
    queryKey: ['erp', 'employees'],
    queryFn: () => apiFetch<unknown[]>('/erp/employees'),
    enabled: tab === 'employees',
  });

  const fuelMutation = useMutation({
    mutationFn: () =>
      apiFetch('/erp/fuel', {
        method: 'POST',
        body: JSON.stringify({ liters: Number(liters), cost: Number(cost) }),
      }),
    onSuccess: () => {
      setLiters('');
      setCost('');
      queryClient.invalidateQueries({ queryKey: ['erp'] });
    },
  });

  const tabs: { id: ErpTab; label: string; hint: string }[] = [
    { id: 'fuel', label: t('erp_fuel'), hint: t('erp_fuel_hint') },
    { id: 'inventory', label: t('erp_inventory'), hint: t('erp_inventory_hint') },
    { id: 'employees', label: t('erp_employees'), hint: t('erp_employees_hint') },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_erp')} description={t('erp_description')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className="text-start">
            <Card selected={tab === item.id} className="h-full transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{item.label}</CardTitle>
                <CardDescription>{item.hint}</CardDescription>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>

      {tab === 'fuel' && (
        <Card className="sq-fade-up max-w-xl">
          <CardHeader>
            <CardTitle>{t('erp_fuel_title')}</CardTitle>
            <CardDescription>{t('erp_fuel_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('liters')}
                type="number"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
              />
              <Input
                label={t('cost_sar')}
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <Button
              onClick={() => fuelMutation.mutate()}
              loading={fuelMutation.isPending}
              disabled={!liters || !cost}
            >
              {t('save')}
            </Button>
            {fuelMutation.error && (
              <p className="text-sm text-[var(--sq-error)]">{fuelMutation.error.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'inventory' && (
        <div className="sq-fade-up space-y-3">
          {inventory.isLoading && <LoadingState />}
          {inventory.error && <ErrorState message={inventory.error.message} />}
          {inventory.data && inventory.data.length === 0 && (
            <EmptyState title={t('no_inventory')} description={t('no_inventory_desc')} />
          )}
          {inventory.data?.map((item, i) => (
            <Card key={i}>
              <CardContent className="pt-1 text-sm text-[var(--sq-text-secondary)]">
                {JSON.stringify(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 'employees' && (
        <div className="sq-fade-up space-y-3">
          {employees.isLoading && <LoadingState />}
          {employees.error && <ErrorState message={employees.error.message} />}
          {employees.data && employees.data.length === 0 && (
            <EmptyState title={t('no_employees')} description={t('no_employees_desc')} />
          )}
          {employees.data?.map((item, i) => (
            <Card key={i}>
              <CardContent className="pt-1 text-sm text-[var(--sq-text-secondary)]">
                {JSON.stringify(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
