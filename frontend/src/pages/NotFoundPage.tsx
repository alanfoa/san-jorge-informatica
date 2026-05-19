import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Página no encontrada</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all"
        >
          <Search className="w-5 h-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
