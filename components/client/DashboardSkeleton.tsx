export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="mt-4 h-6 w-16 bg-slate-300 rounded" />
          <div className="mt-2 h-3 w-20 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}
