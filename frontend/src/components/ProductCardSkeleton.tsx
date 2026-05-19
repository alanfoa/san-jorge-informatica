export function ProductCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-xl border border-cyan-500/20 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-gray-700 rounded" />
        <div className="h-5 w-3/4 bg-gray-700 rounded" />
        <div className="h-4 w-full bg-gray-700 rounded" />
        <div className="h-6 w-20 bg-gray-700 rounded" />
        <div className="h-10 w-full bg-gray-700 rounded-lg" />
      </div>
    </div>
  )
}
