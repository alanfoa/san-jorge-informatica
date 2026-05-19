import { Link } from 'react-router-dom'
import type { Producto } from '@/types'
import { MessageCircle } from 'lucide-react'
import { WHATSAPP } from '@/lib/constants'

interface ProductCardProps {
  producto: Producto
}

export function ProductCard({ producto }: ProductCardProps) {
  const text = encodeURIComponent(`Hola, quiero información sobre ${producto.nombre}`)
  const catNombre = producto.categoria?.nombre ?? ''

  return (
    <div className="group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
      <Link to={`/productos/${producto.id}`} className="block relative overflow-hidden aspect-square">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-sm">
            Sin imagen
          </div>
        )}
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          {catNombre && (
            <span className="text-cyan-400 text-xs uppercase tracking-wider font-medium">
              {catNombre}
            </span>
          )}
        </div>

        <Link to={`/productos/${producto.id}`}>
          <h3 className="text-white font-semibold leading-tight hover:text-cyan-400 transition-colors break-words">
            {producto.nombre}
          </h3>
        </Link>

        <p className="text-gray-400 text-sm line-clamp-2">
          {producto.descripcion}
        </p>

        <p className="text-white font-bold text-lg">${producto.precio.toLocaleString('es-AR')}</p>

        <a
          href={`https://wa.me/${WHATSAPP}?text=${text}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-all group/btn"
        >
          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Consultar Precio
        </a>
      </div>
    </div>
  )
}
