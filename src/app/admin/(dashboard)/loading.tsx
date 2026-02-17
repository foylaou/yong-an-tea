export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title skeleton */}
      <div className="h-8 w-48 rounded bg-gray-200" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-5 shadow">
            <div className="flex items-center">
              <div className="h-12 w-16 rounded-md bg-gray-200" />
              <div className="ml-5 h-4 w-20 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-10 w-10 rounded bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
