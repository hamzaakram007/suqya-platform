'use client';

import { useState } from 'react';

export default function SupplierDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم' },
    { id: 'orders', label: 'الطلبات' },
    { id: 'fleet', label: 'الأسطول' },
    { id: 'drivers', label: 'السائقين' },
    { id: 'settlements', label: 'التسويات' },
    { id: 'reports', label: 'التقارير' },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-teal-700 text-white p-4">
        <h1 className="text-xl font-bold">سقيا — بوابة المورد</h1>
        <p className="text-sm opacity-80">شركة المياه الوطنية للنقل</p>
      </header>

      <nav className="bg-white shadow flex gap-1 p-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              activeTab === tab.id ? 'bg-teal-700 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'fleet' && <FleetView />}
        {activeTab === 'drivers' && <DriversView />}
        {activeTab === 'settlements' && <SettlementsView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'طلبات معلقة', value: 5 },
        { label: 'مكتملة اليوم', value: 23 },
        { label: 'الإيرادات', value: '12,450 ر.س' },
        { label: 'سائقين متاحين', value: 8 },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500">{kpi.label}</p>
          <p className="text-2xl font-bold text-teal-700">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

function OrdersView() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold mb-4">طلبات واردة</h2>
      <p className="text-gray-500">قبول / رفض الطلبات — تعيين السائقين</p>
    </div>
  );
}

function FleetView() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold mb-4">إدارة الأسطول</h2>
      <p className="text-gray-500">الشاحنات، الصيانة، سعة الخزانات</p>
    </div>
  );
}

function DriversView() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold mb-4">السائقين</h2>
      <p className="text-gray-500">جدولة الورديات، الأداء، المستندات</p>
    </div>
  );
}

function SettlementsView() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold mb-4">التسويات المالية</h2>
      <p className="text-gray-500">التسويات الشهرية، العمولات، المدفوعات المعلقة</p>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold mb-4">التقارير</h2>
      <p className="text-gray-500">الإيرادات، الأرباح والخسائر، تقارير الضريبة</p>
    </div>
  );
}
