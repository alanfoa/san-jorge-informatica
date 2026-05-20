import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { WHATSAPP } from '@/lib/constants'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle } from 'lucide-react'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart()

  function whatsappText() {
    const lines = items.map(
      (item, i) => `${i + 1}. ${item.producto.nombre} (x${item.cantidad})`
    )
    return encodeURIComponent(
      `¡Hola! Quiero consultar por este pedido:\n\n${lines.join('\n')}`
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-400 mb-8">Agregá productos desde nuestro catálogo</p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver Catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/productos" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Seguir comprando
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-cyan-400" />
              Carrito
              <span className="text-lg text-gray-400 font-normal">({totalItems} productos)</span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.producto.id}
              className="flex items-center gap-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4"
            >
              <Link to={`/productos/${item.producto.id}`} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                {item.producto.imagen ? (
                  <img src={item.producto.imagen} alt={item.producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/productos/${item.producto.id}`} className="text-white font-medium hover:text-cyan-400 transition-colors line-clamp-1">
                  {item.producto.nombre}
                </Link>
                {item.producto.precio > 0 && (
                  <p className="text-cyan-400 text-sm font-bold mt-1">
                    ${item.producto.precio.toLocaleString('es-AR')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-white font-medium">{item.cantidad}</span>
                <button
                  onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.producto.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6 text-center">
          <p className="text-gray-400 mb-4">Los precios y disponibilidad se confirmarán al enviar la consulta</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${whatsappText()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-600/50 hover:shadow-green-600/70 hover:scale-105 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            Enviar pedido por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
