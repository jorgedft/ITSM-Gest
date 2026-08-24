export function StatsCard({ label, value, icon: Icon, color = "bg-brand-500", sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`${color} p-3 rounded-xl shrink-0`}>
        {Icon && <Icon size={22} className="text-white" />}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm text-gray-500 truncate">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}