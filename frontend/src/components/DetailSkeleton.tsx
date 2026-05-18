export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-5 w-48 bg-gray-700 rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="aspect-square rounded-2xl bg-gray-800" />
          <div className="space-y-6">
            <div className="h-6 w-32 bg-gray-700 rounded-full" />
            <div className="h-10 w-3/4 bg-gray-700 rounded" />
            <div className="h-8 w-40 bg-gray-700 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-700 rounded" />
              <div className="h-4 w-5/6 bg-gray-700 rounded" />
            </div>
            <div className="space-y-3 pt-6">
              <div className="h-14 w-full bg-gray-700 rounded-xl" />
              <div className="h-4 w-64 bg-gray-700 rounded mx-auto" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="h-8 w-64 bg-gray-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
