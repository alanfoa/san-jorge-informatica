import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton'
import { useProductosActivos } from '@/hooks/queries'
import {
  Cpu, HardDrive, MonitorPlay, Gamepad2, Monitor,
  Printer, Tablet, Package, Headphones, Camera, Wifi,
  Search, MessageCircle, Truck, Zap, CircuitBoard,
} from 'lucide-react'
import { WHATSAPP } from '@/lib/constants'

function iconoParaCategoria(nombre: string): React.ReactNode {
  const n = nombre.toLowerCase()
  if (/video|vga|grafica|monitor/i.test(n)) return <MonitorPlay className="w-8 h-8" />
  if (/micro|procesador|cpu/i.test(n)) return <Cpu className="w-8 h-8" />
  if (/mother|placa.madre|motherboard/i.test(n)) return <CircuitBoard className="w-8 h-8" />
  if (/disco|ssd|almacenamiento|hd[ds]/i.test(n)) return <HardDrive className="w-8 h-8" />
  if (/mouse|teclado|periferico|parlante|audifono/i.test(n)) return <Gamepad2 className="w-8 h-8" />
  if (/router|wifi|red|conectividad|switch|modem|access.point/i.test(n)) return <Wifi className="w-8 h-8" />
  if (/impresora|cartucho|tinta|consumible/i.test(n)) return <Printer className="w-8 h-8" />
  if (/tablet/i.test(n)) return <Tablet className="w-8 h-8" />
  if (/camara|web.cam/i.test(n)) return <Camera className="w-8 h-8" />
  if (/notebook|pc|computadora/i.test(n)) return <Monitor className="w-8 h-8" />
  if (/cooler|gabinete|fuente/i.test(n)) return <Package className="w-8 h-8" />
  if (/auricular|cascos/i.test(n)) return <Headphones className="w-8 h-8" />
  return <MonitorPlay className="w-8 h-8" />
}

const CLEAN_NAMES: Record<string, string> = {
  'Conectividad': 'Conectividad',
  'Electrodomesticos': 'Electrodomésticos',
  'Fuentes De Alimentacion Gabinetes Y Fuentes': 'Fuentes de Alimentación',
  'Multifuncion Impresoras': 'Impresoras Multifunción',
  'Ink Jet Impresoras': 'Impresoras Ink Jet',
  'Memorias Ram': 'Memorias RAM',
  'Amd Microprocesadores': 'AMD',
  'Intel Microprocesadores': 'Intel',
  'Monitor Consumo Monitores': 'Monitores de Consumo',
  'Monitor Corporativo Monitores': 'Monitores Corporativos',
  'Monitor Gamer Monitores': 'Monitores Gamer',
  'Plataforma Amd Mothers': 'Plataforma AMD',
  'Plataforma Intel Mothers': 'Plataforma Intel',
  'Linea Nvidia Geforce Placas De Video': 'NVIDIA GeForce',
  'Linea Quadro Radeon Pro Placas De Video': 'NVIDIA Quadro / AMD Radeon Pro',
  'Linea Amd Radeon Placas De Video': 'AMD Radeon',
  'Papel Resma Varios': 'Papel y Resmas',
  'Streaming Gamers': 'Streaming',
  'Energia': 'Energía',
  'Gabinetes': 'Gabinetes',
  'Disco Rigido Externo Discos Rigidos Ssd': 'Discos Externos',
  'Consumibles': 'Consumibles',
  'Router Conectividad': 'Routers',
  'All In One Computadoras': 'All In One',
  'Media Conv Modulos Conectividad': 'Media Converter',
  'Impresoras': 'Impresoras',
  'Switches Administrables Conectividad': 'Switches Administrables',
  'Super Ofertas': 'Super Ofertas',
  'Notebooks': 'Notebooks',
  'Switches No Administrables Conectividad': 'Switches No Administrables',
  'Computadoras': 'Computadoras',
  'Gabinetes Con Fuente Gabinetes Y Fuentes': 'Gabinetes con Fuente',
  'Destacados': 'Destacados',
  'Coolers': 'Coolers',
  'Tintas Consumibles': 'Tintas',
  'Cartuchos Consumibles': 'Cartuchos',
  'Almacenamiento': 'Almacenamiento',
  'Accesorios Gamer Gamers': 'Accesorios Gamer',
  'Mousepads Perifericos': 'Mousepads',
  'Sillas Y Escritorios Gamers': 'Sillas y Escritorios',
  'Placas De Red Wifi Pci Conectividad': 'Placas WiFi PCI',
  'Smart Home Conectividad': 'Smart Home',
  'Consumibles Hp Consumibles': 'HP Consumibles',
  'Perifericos': 'Periféricos',
  'Carry Disk Discos Rigidos Ssd': 'Carry Disk',
  'De Red Cables Conectividad': 'Cables de Red',
  'Camaras Ip Conectividad': 'Cámaras IP',
  'Watercoolers Coolers': 'Watercoolers',
  'Proyectores': 'Proyectores',
  'Tablets': 'Tablets',
  'Mouse Perifericos': 'Mouse',
  'Teclados Perifericos': 'Teclados',
  'Parlantes Perifericos': 'Parlantes',
  'Gamers': 'Gamers',
  'Web Cam Perifericos': 'Webcams',
  'Microfonos Perifericos': 'Micrófonos',
  'Teclado Mouse Perifericos': 'Teclado + Mouse',
  'Teclados Gamers': 'Teclados Gamer',
  'Pc Computadoras': 'PC',
  'Accesorios Bluetooth Conectividad': 'Accesorios Bluetooth',
  'Access Point Y Extensores De Rango Conectividad': 'Access Points',
  'Modem Adsl Y Gpon Conectividad': 'Módems ADSL / GPON',
  'Placas De Red Ethernet Y Adaptadores Usb Conectividad': 'Placas Ethernet / USB',
  'Placas De Red Wifi Usb Conectividad': 'Placas WiFi USB',
  'Poe Power Over Ethernet Conectividad': 'PoE / Power over Ethernet',
  'Router Wireless Conectividad': 'Routers Wireless',
  'Disco Ssd Discos Rigidos Ssd': 'Discos SSD',
  'Disco Ssd M2 Discos Rigidos Ssd': 'Discos SSD M.2',
  'Gabinetes Sin Fuente Gabinetes Y Fuentes': 'Gabinetes sin Fuente',
}

function nombreLimpio(original: string): string {
  return CLEAN_NAMES[original] ?? original
}

export function HomePage() {
  const { data: productos = [], isLoading } = useProductosActivos()

  const productosMostrados = productos.filter(p => p.destacado).slice(0, 4)
  if (productosMostrados.length < 4) {
    const rest = productos.filter(p => !p.destacado).slice(0, 4 - productosMostrados.length)
    productosMostrados.push(...rest)
  }

  const catMap = new Map<string, { nombre: string; slug: string; count: number }>()
  for (const p of productos) {
    const slug = p.categoria?.slug
    const nombre = p.categoria?.nombre
    if (slug && nombre) {
      if (!catMap.has(slug)) catMap.set(slug, { nombre, slug, count: 0 })
      catMap.get(slug)!.count++
    }
  }

  interface CatDeseada { nombre: string; keywords: string[]; soloSlugs?: string[] }
  const DESEADAS: CatDeseada[] = [
    { nombre: 'Procesadores', keywords: ['procesador', 'microprocesador'] },
    { nombre: 'Tarjetas Gráficas', keywords: ['grafica', 'video', 'vga'] },
    { nombre: 'Memoria Ram', keywords: ['memoria', 'ram'] },
    { nombre: 'Almacenamiento', keywords: ['almacenamiento', 'disco', 'ssd', 'hdd'] },
    { nombre: 'Fuentes', keywords: ['fuente', 'fuente de alimentacion'], soloSlugs: ['fuentes'] },
    { nombre: 'Gabinetes', keywords: ['gabinete'], soloSlugs: ['gabinetes'] },
    { nombre: 'Mothers', keywords: ['mother', 'motherboard', 'placa madre'] },
    { nombre: 'Periféricos', keywords: ['periferico', 'teclado', 'mouse'] },
  ]
  const catList = [...catMap.values()]
  const slugsUsados = new Set<string>()
  const topCats = DESEADAS.map(({ nombre, keywords, soloSlugs }) => {
    let matches = catList.filter(c =>
      keywords.some(k => c.nombre.toLowerCase().includes(k))
    )
    if (soloSlugs) {
      matches = matches.filter(m => soloSlugs.includes(m.slug))
    }
    if (matches.length === 0) return null
    for (const m of matches) slugsUsados.add(m.slug)
    return {
      nombre,
      slugs: matches.map(m => m.slug),
      count: matches.reduce((s, c) => s + c.count, 0)
    }
  }).filter((c): c is NonNullable<typeof c> => c !== null)

  const MAX_DESEADAS = DESEADAS.length
  if (topCats.length < MAX_DESEADAS) {
    const restantes = catList
      .filter(c => !slugsUsados.has(c.slug))
      .sort((a, b) => b.count - a.count)
    for (const r of restantes.slice(0, MAX_DESEADAS - topCats.length)) {
      topCats.push({ nombre: r.nombre, slugs: [r.slug], count: r.count })
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBhZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs uppercase tracking-widest font-bold">
                  Tecnología de Alto Rendimiento
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-white">Potenciá tu</span>{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  Setup
                </span>
                <br />
                <span className="text-white">Hardware Premium</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Explorá nuestro catálogo, elegí tus componentes y cotizá al
                instante por WhatsApp con atención personalizada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/productos"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                >
                  Ver Catálogo
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-cyan-500/30 text-white rounded-xl font-bold hover:bg-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contactar
                </a>
              </div>
            </div>

            <div className="relative group">
              <div className="relative">
                <img
                  src="/5090.png"
                  alt="Gaming Setup"
                  className="rounded-2xl shadow-2xl shadow-purple-500/30 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-purple-500/60"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 blur-3xl -z-10 group-hover:from-cyan-500/40 group-hover:to-purple-600/40 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section id="categorias" className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-cyan-400">[</span> Componentes por Categoría{' '}
              <span className="text-cyan-400">]</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Navegá por tipo de hardware para encontrar lo que necesitás
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCats.map((cat) => { return (
                <Link
                  key={cat.slugs[0]}
                  to={`/productos?${cat.slugs.map(s => `categoria=${encodeURIComponent(s)}`).join('&')}`}
                  className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 hover:border-cyan-500/60 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-2"
                >
                  <div className="text-cyan-400 mb-4 group-hover:scale-110 group-hover:text-cyan-300 transition-all">
                    {iconoParaCategoria(nombreLimpio(cat.nombre))}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-cyan-400 transition-colors">
                    {nombreLimpio(cat.nombre)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {cat.count} productos disponibles
                  </p>
                  <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                </Link>
              );})}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all"
            >
              Ver Catálogo Completo
              <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hardware <span className="text-cyan-400">Destacado</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Los componentes más potentes del momento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : productosMostrados.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all"
            >
              Ver Catálogo Completo
              <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo Comprar */}
      <section id="como-comprar" className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ¿Cómo <span className="text-cyan-400">Armar tu Pedido</span>?
            </h2>
            <p className="text-gray-400 text-lg">
              Tres pasos simples para tu nuevo hardware
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8 hover:border-cyan-500/50 transition-all">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/50">1</div>
              <div className="mt-6 mb-4 text-cyan-400"><Search className="w-12 h-12" /></div>
              <h3 className="text-white font-bold text-xl mb-3">Elegí tus Productos</h3>
              <p className="text-gray-400 leading-relaxed">Navegá por la web y seleccioná el hardware que necesitás para tu PC.</p>
            </div>

            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8 hover:border-cyan-500/50 transition-all">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/50">2</div>
              <div className="mt-6 mb-4 text-cyan-400"><MessageCircle className="w-12 h-12" /></div>
              <h3 className="text-white font-bold text-xl mb-3">Consultá al Instante</h3>
              <p className="text-gray-400 leading-relaxed">Hacé click en el botón de WhatsApp con tu producto seleccionado.</p>
            </div>

            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-8 hover:border-cyan-500/50 transition-all">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/50">3</div>
              <div className="mt-6 mb-4 text-cyan-400"><Truck className="w-12 h-12" /></div>
              <h3 className="text-white font-bold text-xl mb-3">Coordiná Pago y Envío</h3>
              <p className="text-gray-400 leading-relaxed">Te pasamos el precio actualizado, congelamos el stock y coordinamos la entrega.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
