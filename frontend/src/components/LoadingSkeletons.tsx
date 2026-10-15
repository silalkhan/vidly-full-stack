function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-slate-800 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <SkeletonBlock className="mb-4 h-6 w-3/4" />
      <SkeletonBlock className="mb-6 h-5 w-20 rounded-md" />
      <SkeletonBlock className="mb-2 h-4 w-1/2" />
      <SkeletonBlock className="h-4 w-2/3" />
    </article>
  );
}

export function MovieListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading movies"
      role="status"
    >
      <span className="sr-only">Loading movies...</span>
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">Loading table data...</span>
      <div
        className="grid gap-4 border-b border-slate-800 bg-slate-800/50 px-6 py-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <SkeletonBlock key={`heading-${index}`} className="h-4 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="grid gap-4 border-b border-slate-800 px-6 py-5 last:border-0"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <SkeletonBlock
              key={`cell-${columnIndex}`}
              className={`h-4 ${columnIndex === 0 ? "w-4/5" : "w-3/5"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading dashboard statistics"
      role="status"
    >
      <span className="sr-only">Loading dashboard statistics...</span>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-xl border border-slate-800 bg-slate-900 p-5"
        >
          <SkeletonBlock className="mb-4 h-4 w-1/2" />
          <SkeletonBlock className="h-8 w-1/3" />
        </div>
      ))}
    </div>
  );
}
