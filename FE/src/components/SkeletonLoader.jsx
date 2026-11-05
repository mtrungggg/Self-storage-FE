export function CardSkeleton({ count = 3, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Shimmer gradient overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/60 to-transparent dark:via-slate-800/40" />
          
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4, className = "" }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Table header skeleton */}
      <div className="border-b border-slate-200/80 bg-slate-50/70 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-slate-200/80 dark:bg-slate-700" style={{ width: `${60 + (i % 3) * 15}%` }} />
          ))}
        </div>
      </div>

      {/* Table rows skeleton with shimmer */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="relative overflow-hidden px-6 py-4">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 to-transparent dark:via-slate-800/30" />
            <div className="grid items-center gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, c) => (
                <div
                  key={c}
                  className="h-3.5 rounded bg-slate-150 dark:bg-slate-800"
                  style={{ width: `${50 + ((r + c) % 4) * 12}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type = "card", ...props }) {
  if (type === "table") return <TableSkeleton {...props} />;
  return <CardSkeleton {...props} />;
}
