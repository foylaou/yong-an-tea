export default function SettingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-8 w-32 rounded bg-gray-200" />
      <div className="flex gap-6 min-h-[600px]">
        {/* Sidebar skeleton */}
        <div className="w-56 shrink-0">
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-gray-200" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 space-y-4 rounded-lg bg-white p-6 shadow">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-3/4 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
