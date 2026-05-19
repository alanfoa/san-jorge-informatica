import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '@/hooks/queries'
import { useToast } from '@/hooks/useToast'
import type { Categoria } from '@/types'

export function AdminCategoriasPage() {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
  const { data: categorias = [], isLoading } = useCategorias()
  const createCategoria = useCreateCategoria()
  const updateCategoria = useUpdateCategoria()
  const deleteCategoria = useDeleteCategoria()
  const { toast } = useToast()
  const [modal, setModal] = useState<{ open: boolean; edit?: Categoria }>({ open: false })
  const [form, setForm] = useState({ nombre: '', descripcion: '', imagen: '' })

  function openNew() {
    setForm({ nombre: '', descripcion: '', imagen: '' })
    setModal({ open: true })
  }

  function openEdit(c: Categoria) {
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '', imagen: c.imagen ?? '' })
    setModal({ open: true, edit: c })
  }

  function closeModal() {
    setModal({ open: false })
    setForm({ nombre: '', descripcion: '', imagen: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    try {
      if (modal.edit) {
        await updateCategoria.mutateAsync({ id: modal.edit.id, data: form, token })
        toast('success', 'Categoría actualizada')
      } else {
        await createCategoria.mutateAsync({ data: form, token })
        toast('success', 'Categoría creada')
      }
      closeModal()
    } catch {
      toast('error', 'Error al guardar categoría')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar categoría?')) return
    try {
      await deleteCategoria.mutateAsync({ id, token: token! })
      toast('success', 'Categoría eliminada')
    } catch {
      toast('error', 'Error al eliminar categoría')
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">&larr; Volver</Link>
            <h1 className="text-2xl font-bold text-white">Categorías</h1>
          </div>
          <button onClick={openNew} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all">Nueva categoría</button>
        </div>

        {isLoading ? (
          <div className="overflow-x-auto rounded-xl border border-cyan-500/20 animate-pulse">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-gray-900/90 text-left">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="py-3 px-4"><div className="h-4 w-16 bg-gray-700 rounded" /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, row) => (
                  <tr key={row} className="border-b border-cyan-500/10">
                    {Array.from({ length: 5 }).map((_, col) => (
                      <td key={col} className="py-3 px-4"><div className="h-4 w-20 bg-gray-700 rounded" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-cyan-500/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-gray-900/90 text-left">
                  <th className="py-3 px-4 font-medium text-cyan-400">ID</th>
                  <th className="py-3 px-4 font-medium text-cyan-400">Nombre</th>
                  <th className="py-3 px-4 font-medium text-cyan-400">Slug</th>
                  <th className="py-3 px-4 font-medium text-cyan-400">Productos</th>
                  <th className="py-3 px-4 font-medium text-cyan-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{c.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{c.nombre}</td>
                    <td className="py-3 px-4 text-gray-400">{c.slug}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin?categoriaId=${c.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                      >
                        Ver productos
                      </Link>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Editar</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No hay categorías</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 rounded-2xl border border-cyan-500/20 p-8 w-full max-w-md mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">{modal.edit ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 focus:border-cyan-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 focus:border-cyan-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL de imagen</label>
                  <input
                    type="url"
                    value={form.imagen}
                    onChange={e => setForm(prev => ({ ...prev, imagen: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-cyan-500/20 focus:border-cyan-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all"
                  >
                    {modal.edit ? 'Guardar cambios' : 'Crear categoría'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
