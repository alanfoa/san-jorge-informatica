export function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-500/20 animate-pulse">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyan-500/20 bg-gray-900/90 text-left">
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <div className="h-4 w-16 bg-gray-700 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, row) => (
            <tr key={row} className="border-b border-cyan-500/10">
              {Array.from({ length: 6 }).map((_, col) => (
                <td key={col} className="py-3 px-4">
                  <div className="h-4 w-20 bg-gray-700 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
