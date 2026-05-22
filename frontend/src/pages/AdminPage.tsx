import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TableSkeleton } from '@/components/TableSkeleton'
import { useProductos, useDeleteProducto, useCategorias } from '@/hooks/queries'
import { useToast } from '@/hooks/useToast'
import { api } from '@/api/client'
import { formatPrice } from '@/lib/format'
import { Search, Loader2, RefreshCw, X } from 'lucide-react'

export function AdminPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [mostrarInactivos, setMostrarInactivos] = useState(false)
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
  const { data: allProductos = [], isLoading } = useProductos()
  const { data: categorias = [] } = useCategorias()
  const deleteProducto = useDeleteProducto()

  const filtrado = useMemo(() => {
    let items = allProductos
    if (catFilter) items = items.filter(p => p.categoriaId === Number(catFilter))
    if (!mostrarInactivos) items = items.filter(p => p.activo)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      )
    }
    return items
  }, [allProductos, catFilter, mostrarInactivos, search])

  if (!token) {
    navigate('/admin/login')
    return null
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar producto?')) return
    if (!token) return
    try {
      await deleteProducto.mutateAsync({ id, token })
      toast('success', 'Producto eliminado')
    } catch {
      toast('error', 'Error al eliminar producto')
    }
  }

  async function handleSyncInvid() {
    if (!token) return
    setSyncing(true)
    try {
      const res = await api.syncInvid(token)
      toast('success', `Invid: ${res.created} creados, ${res.updated} act., ${res.skipped} omitidos (${res.duration})`)
      window.location.reload()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al sincronizar'
      toast('error', msg)
    } finally {
      setSyncing(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Administración</h1>
          <div className="flex gap-3">
            <Link to="/admin/nuevo" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all">Nuevo producto</Link>
            <Link to="/admin/categorias" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all">Categorías</Link>
            <button
              onClick={handleSyncInvid}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Sincronizando...' : 'Sinc. Invid'}
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Cerrar sesión</button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarInactivos}
              onChange={e => setMostrarInactivos(e.target.checked)}
              className="rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-500/50"
            />
            Mostrar inactivos
          </label>

          <span className="text-sm text-gray-500 ml-auto">
            {filtrado.length} / {allProductos.length} productos
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
        <div className="overflow-x-auto rounded-xl border border-cyan-500/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-gray-900/90 text-left">
                <th className="py-3 px-4 font-medium text-cyan-400">ID</th>
                <th className="py-3 px-4 font-medium text-cyan-400">Nombre</th>
                <th className="py-3 px-4 font-medium text-cyan-400">Categoría</th>
                <th className="py-3 px-4 font-medium text-cyan-400">Precio</th>
                <th className="py-3 px-4 font-medium text-cyan-400">Activo</th>
                <th className="py-3 px-4 font-medium text-cyan-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No se encontraron productos</td></tr>
              ) : (
                filtrado.map(p => {
                  const catNombre = p.categoria?.nombre ?? '—'
                  return (
                    <tr key={p.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                      <td className="py-3 px-4 text-gray-400">{p.id}</td>
                      <td className="py-3 px-4 font-medium text-white">{p.nombre}</td>
                      <td className="py-3 px-4 text-gray-300">{catNombre}</td>
                      <td className="py-3 px-4 text-cyan-300">${formatPrice(p.precio)}</td>
                      <td className="py-3 px-4">{p.activo ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Link to={`/admin/editar/${p.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Editar</Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
