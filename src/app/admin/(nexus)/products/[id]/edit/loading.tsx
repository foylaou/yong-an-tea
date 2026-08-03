export default function ProductEditLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-base-300 h-8 w-64 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card card-border bg-base-100">
          <div className="card-body space-y-4">
            <div className="bg-base-300 h-6 w-32 rounded" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-base-300 h-10 rounded" />
              <div className="bg-base-300 h-10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
