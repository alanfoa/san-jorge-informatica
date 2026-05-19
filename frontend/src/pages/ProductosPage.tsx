import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton'
import { useProductosActivos, useCategorias } from '@/hooks/queries'
import { Search, Filter, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

const ITEMS_PER_PAGE = 24

const GRUPOS: [string, string][] = [
  ['streaming', 'Gamers'],
  ['accesorios gamer', 'Gamers'],
  ['sillas y escritorios', 'Gamers'],
  ['teclados gamers', 'Gamers'],
  ['gamers', 'Gamers'],

  ['placas de video', 'Placas de Video'],

  ['carry disk', 'Almacenamiento'],
  ['disco rigido externo', 'Almacenamiento'],
  ['disco ssd m2', 'Almacenamiento'],
  ['disco ssd', 'Almacenamiento'],
  ['almacenamiento', 'Almacenamiento'],

  ['microprocesador', 'Procesadores'],
  ['procesador', 'Procesadores'],

  ['plataforma', 'Motherboards'],
  ['mothers', 'Motherboards'],

  ['monitor corporativo', 'Monitores'],
  ['monitor consumo', 'Monitores'],
  ['monitor gamer', 'Monitores'],
  ['monitores', 'Monitores'],

  ['watercoolers', 'Coolers'],
  ['coolers', 'Coolers'],

  ['multifuncion', 'Impresoras'],
  ['ink jet', 'Impresoras'],
  ['impresoras', 'Impresoras'],

  ['tintas', 'Consumibles'],
  ['cartuchos', 'Consumibles'],
  ['consumibles hp', 'Consumibles'],
  ['consumibles', 'Consumibles'],

  ['web cam', 'Periféricos'],
  ['mousepads', 'Periféricos'],
  ['microfonos', 'Periféricos'],
  ['parlantes', 'Periféricos'],
  ['teclado mouse', 'Periféricos'],
  ['mouse', 'Periféricos'],
  ['teclados', 'Periféricos'],
  ['perifericos', 'Periféricos'],

  ['all in one', 'Computadoras'],
  ['pc computadoras', 'Computadoras'],
  ['computadoras', 'Computadoras'],

  ['gabinetes con fuente', 'Gabinetes y Fuentes'],
  ['gabinetes sin fuente', 'Gabinetes y Fuentes'],
  ['fuentes de alimentacion', 'Gabinetes y Fuentes'],
  ['gabinetes', 'Gabinetes y Fuentes'],

  ['switches administrables', 'Conectividad'],
  ['switches no administrables', 'Conectividad'],
  ['access point', 'Conectividad'],
  ['placas de red ethernet', 'Conectividad'],
  ['placas de red wifi pci', 'Conectividad'],
  ['placas de red wifi usb', 'Conectividad'],
  ['modem adsl', 'Conectividad'],
  ['router wireless', 'Conectividad'],
  ['poe power over ethernet', 'Conectividad'],
  ['media conv', 'Conectividad'],
  ['camaras ip', 'Conectividad'],
  ['accesorios bluetooth', 'Conectividad'],
  ['smart home', 'Conectividad'],
  ['de red cables', 'Conectividad'],
  ['router', 'Conectividad'],
  ['conectividad', 'Conectividad'],

  ['papel resma', 'Papel y Varios'],
  ['destacados', 'Destacados'],
  ['electrodomesticos', 'Electrodomésticos'],
  ['energia', 'Energía'],
  ['memorias ram', 'Memorias Ram'],
  ['notebooks', 'Notebooks'],
  ['proyectores', 'Proyectores'],
  ['super ofertas', 'Super Ofertas'],
  ['tablets', 'Tablets'],
]

function getGrupo(nombre: string): string {
  const n = nombre.toLowerCase()
  for (const [keyword, grupo] of GRUPOS) {
    if (n.includes(keyword)) return grupo
  }
  return nombre
}

export function ProductosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: productos = [], isLoading } = useProductosActivos()
  const { data: categorias = [] } = useCategorias()
  const [busqueda, setBusqueda] = useState('')
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(
    searchParams.getAll('categoria')
  )
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [gruposAbiertos, setGruposAbiertos] = useState<Set<string>>(new Set())

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const catSlug = producto.categoria?.slug ?? ''
      const catNombre = producto.categoria?.nombre ?? ''
      const matchBusqueda =
        busqueda === '' ||
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (producto.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
        catNombre.toLowerCase().includes(busqueda.toLowerCase())

      const matchCategoria =
        categoriasSeleccionadas.length === 0 ||
        categoriasSeleccionadas.includes(catSlug)

      return matchBusqueda && matchCategoria
    })
  }, [busqueda, categoriasSeleccionadas, productos])

  const categoriasAgrupadas = useMemo(() => {
    const grupos = new Map<string, typeof categorias>()
    for (const cat of categorias) {
      const grupo = getGrupo(cat.nombre)
      if (!grupos.has(grupo)) grupos.set(grupo, [])
      grupos.get(grupo)!.push(cat)
    }
    return [...grupos.entries()]
      .map(([nombre, items]) => ({
        nombre,
        items: items.sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [categorias])

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE))
  const inicio = (pagina - 1) * ITEMS_PER_PAGE
  const productosPagina = productosFiltrados.slice(inicio, inicio + ITEMS_PER_PAGE)

  useEffect(() => {
    setPagina(1)
  }, [busqueda, categoriasSeleccionadas])

  const toggleCategoria = (slug: string) => {
    setCategoriasSeleccionadas((prev) => {
      const next = prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
      const params = new URLSearchParams()
      for (const c of next) params.append('categoria', c)
      setSearchParams(params, { replace: true })
      return next
    })
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriasSeleccionadas([])
    setSearchParams({})
  }

  const filtrosActivos = categoriasSeleccionadas.length

  function Paginacion() {
    if (totalPaginas <= 1) return null
    const paginas: number[] = []
    const maxVisibles = 5
    let desde = Math.max(1, pagina - Math.floor(maxVisibles / 2))
    let hasta = Math.min(totalPaginas, desde + maxVisibles - 1)
    if (hasta - desde + 1 < maxVisibles) desde = Math.max(1, hasta - maxVisibles + 1)

    for (let i = desde; i <= hasta; i++) paginas.push(i)

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {desde > 1 && (
          <>
            <button onClick={() => setPagina(1)} className="w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm">1</button>
            {desde > 2 && <span className="text-gray-600">...</span>}
          </>
        )}
        {paginas.map(p => (
          <button
            key={p}
            onClick={() => setPagina(p)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              p === pagina
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {p}
          </button>
        ))}
        {hasta < totalPaginas && (
          <>
            {hasta < totalPaginas - 1 && <span className="text-gray-600">...</span>}
            <button onClick={() => setPagina(totalPaginas)} className="w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm">{totalPaginas}</button>
          </>
        )}
        <button
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Catálogo <span className="text-cyan-400">Completo</span>
          </h1>
          <p className="text-gray-400 text-lg">Explorá toda nuestra selección de hardware premium</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/90 backdrop-blur-sm border border-cyan-500/20 focus:border-cyan-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-6 py-3 bg-gray-900/90 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 relative"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {filtrosActivos > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {filtrosActivos}
                </span>
              )}
            </button>
          </div>

          {mostrarFiltros && (
            <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Categorías</h3>
                <button onClick={limpiarFiltros} className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Limpiar todo
                </button>
              </div>
              <div className="space-y-2">
                {categoriasAgrupadas.map((grupo) => {
                  const abierto = gruposAbiertos.has(grupo.nombre)
                  return (
                    <div key={grupo.nombre}>
                      <button
                        onClick={() => {
                          const next = new Set(gruposAbiertos)
                          if (abierto) next.delete(grupo.nombre)
                          else next.add(grupo.nombre)
                          setGruposAbiertos(next)
                        }}
                        className="flex items-center gap-2 w-full text-left text-cyan-400 font-semibold text-sm py-1.5 hover:text-cyan-300 transition-colors"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${abierto ? '' : '-rotate-90'}`} />
                        {grupo.nombre}
                      </button>
                      {abierto && (
                        <div className="ml-4 space-y-1 border-l border-cyan-500/20 pl-3">
                          {grupo.items.map((cat) => (
                            <label key={cat.id} className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer group py-0.5">
                              <input
                                type="checkbox"
                                checked={categoriasSeleccionadas.includes(cat.slug)}
                                onChange={() => toggleCategoria(cat.slug)}
                                className="w-3.5 h-3.5 rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50 focus:ring-2"
                              />
                              <span className="text-xs group-hover:text-cyan-400 transition-colors">{cat.nombre}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                ({productos.filter((p) => p.categoria?.slug === cat.slug).length})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-400">
            Mostrando <span className="text-cyan-400 font-semibold">{productosFiltrados.length}</span>{' '}
            {productosFiltrados.length === 1 ? 'producto' : 'productos'}
            {totalPaginas > 1 && (
              <span className="text-gray-600">
                {' '}— Página {pagina} de {totalPaginas}
              </span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : productosFiltrados.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosPagina.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Paginacion />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4 text-gray-600"><Search className="w-16 h-16 mx-auto" /></div>
            <h3 className="text-white text-xl font-bold mb-2">No se encontraron productos</h3>
            <p className="text-gray-400 mb-6">Intentá con otros filtros o términos de búsqueda</p>
            <button onClick={limpiarFiltros} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all">
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
