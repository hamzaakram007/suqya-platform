interface KpiCardProps {
  title: string;
  value: string | number;
}

export function KpiCard({ title, value }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}
