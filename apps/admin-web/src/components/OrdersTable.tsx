const mockOrders = [
  { id: 'SQ-001247', customer: 'محمد العتيبي', status: 'in_transit', amount: 250 },
  { id: 'SQ-001246', customer: 'شركة البناء', status: 'completed', amount: 400 },
  { id: 'SQ-001245', customer: 'فندق الريتز', status: 'supplier_review', amount: 180 },
];

const statusColors: Record<string, string> = {
  in_transit: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  supplier_review: 'bg-yellow-100 text-yellow-800',
};

export function OrdersTable() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">الطلبات الأخيرة</h2>
        <button className="text-sm text-primary hover:underline">تصدير Excel</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-right py-2">رقم الطلب</th>
            <th className="text-right py-2">العميل</th>
            <th className="text-right py-2">الحالة</th>
            <th className="text-right py-2">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {mockOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-2">{order.id}</td>
              <td className="py-2">{order.customer}</td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-2">{order.amount} ر.س</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
