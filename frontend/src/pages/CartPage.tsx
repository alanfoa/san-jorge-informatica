import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/hooks/useToast'
import { WHATSAPP } from '@/lib/constants'
import { sanitizarNombre } from '@/lib/sanitize'
import { api } from '@/api/client'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, MessageCircle, CreditCard, Loader2 } from 'lucide-react'

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart()
  const { toast } = useToast()
  const [pagando, setPagando] = useState(false)
  const [mpDisponible, setMpDisponible] = useState(false)

  const itemsConPrecio = useMemo(
    () => items.filter(i => Number(i.producto.precio) > 0),
    [items]
  )

  const totalMp = useMemo(
    () => itemsConPrecio.reduce((s, i) => s + Number(i.producto.precio) * i.cantidad, 0),
    [itemsConPrecio]
  )

  useEffect(() => {
    api.getMercadoPagoStatus()
      .then(s => setMpDisponible(s.configured))
      .catch(() => setMpDisponible(false))
  }, [])

  async function pagarMercadoPago() {
    if (itemsConPrecio.length === 0) return
    setPagando(true)
    try {
      const res = await api.createMercadoPagoPreference(
        itemsConPrecio.map(i => ({
          title: sanitizarNombre(i.producto.nombre),
          quantity: i.cantidad,
          unit_price: Number(i.producto.precio),
        }))
      )
      window.location.href = res.init_point
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al iniciar el pago'
      toast('error', msg)
    } finally {
      setPagando(false)
    }
  }

  function whatsappText() {
    const lines = items.map(
      (item, i) => {
        const base = `${i + 1}. ${sanitizarNombre(item.producto.nombre)} (x${item.cantidad})`
        if (Number(item.producto.precio) > 0) {
          return `${base} — $${(Number(item.producto.precio) * item.cantidad).toLocaleString('es-AR')}`
        }
        return base
      }
    )
    const total = items.reduce((s, i) => s + (Number(i.producto.precio) > 0 ? Number(i.producto.precio) * i.cantidad : 0), 0)
    const totalLine = total > 0 ? `\n\nTotal: $${total.toLocaleString('es-AR')}` : ''
    return encodeURIComponent(
      `¡Hola! Quiero consultar por este pedido:\n\n${lines.join('\n')}${totalLine}`
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

  const mostrarMp = mpDisponible && itemsConPrecio.length > 0

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
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-400 border border-red-500/30 hover:text-white hover:bg-red-600 hover:border-red-600 rounded-xl transition-all shadow-lg shadow-red-600/10 hover:shadow-red-600/30"
          >
            <Trash2 className="w-4 h-4" />
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
                  <img src={item.producto.imagen} alt={sanitizarNombre(item.producto.nombre)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin img</div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/productos/${item.producto.id}`} className="text-white font-medium hover:text-cyan-400 transition-colors line-clamp-1">
                  {sanitizarNombre(item.producto.nombre)}
                </Link>
                {Number(item.producto.precio) > 0 && (
                  <p className="text-cyan-400 text-sm font-bold mt-1">
                    ${Number(item.producto.precio).toLocaleString('es-AR')}
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
          {mostrarMp ? (
            <p className="text-cyan-300 font-semibold text-lg mb-4">
              Total a pagar: ${totalMp.toLocaleString('es-AR')}
            </p>
          ) : (
            <p className="text-gray-400 mb-4">Los precios y disponibilidad se confirmarán al enviar la consulta</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${whatsappText()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-green-600/50 hover:shadow-green-600/70 hover:scale-105 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
              Consultar por WhatsApp
            </a>
            {mostrarMp && (
              <button
                onClick={pagarMercadoPago}
                disabled={pagando}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/50 hover:shadow-blue-600/70 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pagando ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CreditCard className="w-6 h-6" />
                )}
                Pagar con Mercado Pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
