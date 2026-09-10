export default function KpiCard({
  title,
  value,
  secondaryValue,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string | number;
  secondaryValue?: string;
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
    <div className="bg-[#111827] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:border-slate-700/80 transition">
      <div className="flex justify-between items-start gap-2">
        <div className="text-slate-400 text-xs sm:text-sm font-medium">{title}</div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4 flex flex-col gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {secondaryValue && (
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {secondaryValue}
            </span>
          )}
          {trend && trendLabel && (
            <div className={`text-xs font-medium flex items-center gap-1 ${trendColors[trend]}`}>
              <span>{TrendIcon}</span>
              <span className="truncate">{trendLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
