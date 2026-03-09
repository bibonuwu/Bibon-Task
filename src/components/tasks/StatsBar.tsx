"use client";

interface StatsBarProps {
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Total", value: stats.total, color: "text-zinc-900 dark:text-zinc-100" },
    { label: "To Do", value: stats.todo, color: "text-zinc-500" },
    { label: "In Progress", value: stats.inProgress, color: "text-brand-600" },
    { label: "Done", value: stats.done, color: "text-emerald-600" },
  ];

  // Progress bar
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-5">
      <div className="grid grid-cols-4 gap-3 text-center mb-4">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`text-xl sm:text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-400 mt-2 text-center">{pct}% completed</p>
    </div>
  );
}
