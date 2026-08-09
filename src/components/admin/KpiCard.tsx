export default function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-rose-400",
    neutral: "text-slate-400",
  };

  const TrendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "–";

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-sm flex flex-col">
      <div className="flex justify-between items-start">
        <div className="text-slate-400 text-sm font-medium">{title}</div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="text-3xl font-bold text-white">{value}</div>
        {trend && trendLabel && (
          <div className={`text-sm font-medium flex items-center gap-1 ${trendColors[trend]}`}>
            <span>{TrendIcon}</span>
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
