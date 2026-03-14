export default function ProductEditLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-64 rounded bg-gray-200" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg bg-white p-6 shadow space-y-4">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
