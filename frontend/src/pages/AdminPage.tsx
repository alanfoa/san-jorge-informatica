import { useNavigate, Link } from 'react-router-dom'
import { useProductos, useDeleteProducto } from '@/hooks/queries'

export function AdminPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')
  const { data: productos = [] } = useProductos()
  const deleteProducto = useDeleteProducto()

  if (!token) {
    navigate('/admin/login')
    return null
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await deleteProducto.mutateAsync({ id, token: token! })
    } catch { alert('Error al eliminar') }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Administración</h1>
          <div className="flex gap-3">
            <Link to="/admin/nuevo" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all">Nuevo producto</Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">Cerrar sesión</button>
          </div>
        </div>

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
              {productos.map(p => {
                const catNombre = p.categoria?.nombre ?? '—'
                return (
                  <tr key={p.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{p.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{p.nombre}</td>
                    <td className="py-3 px-4 text-gray-300">{catNombre}</td>
                    <td className="py-3 px-4 text-cyan-300">${p.precio.toLocaleString('es-AR')}</td>
                    <td className="py-3 px-4">{p.activo ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <Link to={`/admin/editar/${p.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Editar</Link>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
