import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { DetailSkeleton } from '@/components/DetailSkeleton'
import { useProducto, useProductosActivos } from '@/hooks/queries'
import { MessageCircle, ArrowLeft, Check, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { WHATSAPP } from '@/lib/constants'

export function ProductoPage() {
  const { id } = useParams<{ id: string }>()
  const productoId = id ? Number(id) : undefined
  const { data: p, isLoading, isError } = useProducto(productoId)
  const { data: todos = [] } = useProductosActivos()
  const [imgIdx, setImgIdx] = useState(0)

  const relacionados = todos.filter(
    r => r.categoria?.slug === p?.categoria?.slug && r.id !== p?.id
  ).slice(0, 4)

  const galeria: string[] = p ? [
    p.imagen,
    ...(p.imagenes?.map(i => i.url) ?? []),
  ].filter((u): u is string => !!u).filter((url, i, arr) => arr.indexOf(url) === i) : []

  const imagenActual = galeria[imgIdx] ?? null

  function prevImg() {
    if (galeria.length <= 1) return
    setImgIdx(i => (i - 1 + galeria.length) % galeria.length)
  }

  function nextImg() {
    if (galeria.length <= 1) return
    setImgIdx(i => (i + 1) % galeria.length)
  }

  if (isLoading) return <DetailSkeleton />
  if (isError || !p) return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/productos" className="text-cyan-400 hover:text-cyan-300 transition-colors">Volver al catálogo</Link>
      </div>
    </div>
  )

  const text = encodeURIComponent(`Hola, quiero información sobre ${p.nombre}`)

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/productos" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-cyan-500/20 group">
              {imagenActual ? (
                <img src={imagenActual} alt={p.nombre} className="w-full h-full object-cover transition-all duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">Sin imagen</div>
              )}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-4 py-2 bg-green-500/90 text-white text-sm font-bold uppercase tracking-wide rounded-lg shadow-lg flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {p.stock > 0 ? 'En Stock' : 'Consultar'}
                </span>
              </div>
              {galeria.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {galeria.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galeria.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === imgIdx
                        ? 'border-cyan-400 ring-1 ring-cyan-400'
                        : 'border-cyan-500/20 hover:border-cyan-500/50'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              {p.categoria && (
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold uppercase tracking-wider rounded-full">
                  {p.categoria.nombre}
                </span>
              )}
              {p.destacado && (
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold uppercase tracking-wider rounded-full">
                  Destacado
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{p.nombre}</h1>

            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              ${p.precio.toLocaleString('es-AR')}
            </p>

            {p.descripcion && (
              <p className="text-gray-400 text-lg leading-relaxed">{p.descripcion}</p>
            )}

            {p.caracteristicas && p.caracteristicas.length > 0 && (
              <div className="border-t border-cyan-500/20 pt-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" /> Especificaciones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.caracteristicas.map((c, i) => (
                    <div key={i} className="bg-gray-900/80 rounded-lg px-4 py-3 border border-cyan-500/10">
                      <span className="text-gray-500 text-xs uppercase tracking-wider">{c.nombre}</span>
                      <p className="text-white font-medium">{c.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${text}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-600/50 hover:shadow-green-600/70 hover:scale-105 transition-all group"
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Consultar Precio por WhatsApp
              </a>
              <p className="text-center text-gray-400 text-sm">Recibí cotización actualizada al instante</p>
            </div>

            <div className="border-t border-cyan-500/20 pt-6 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Asesoramiento técnico personalizado</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Garantía oficial del fabricante</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>

        {relacionados.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-white mb-8">
              Productos <span className="text-cyan-400">Relacionados</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relacionados.map((r) => (
                <ProductCard key={r.id} producto={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
