export function StatCard({ label, value, sublabel }) {
  return (
    <div className="glass-card px-5 py-4 flex flex-col gap-1 min-w-[130px]">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <span className="font-display text-2xl">{value}</span>
      {sublabel && <span className="text-xs text-white/40">{sublabel}</span>}
    </div>
  );
}

export function WeekBars({ dailyBuckets, goalMinutes }) {
  const max = Math.max(goalMinutes, ...dailyBuckets.map((d) => d.minutes), 1);
  const dayLabel = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short" });

  return (
    <div className="glass-card p-5">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-4">This week</p>
      <div className="flex items-end justify-between gap-2 h-32">
        {dailyBuckets.map((d) => (
          <div key={d.date} className="flex flex-col items-center flex-1 gap-2">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-garden-leafDark to-garden-leaf transition-all duration-500"
                style={{ height: `${Math.max(4, (d.minutes / max) * 100)}%` }}
                title={`${d.minutes} min`}
              />
            </div>
            <span className="text-[10px] text-white/40">{dayLabel(d.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
