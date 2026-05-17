import type { Producto } from '@/types'
import { useState, FormEvent } from 'react'
import { useCategorias } from '@/hooks/queries'

interface ProductFormProps {
  initial?: Producto
  onSubmit: (data: Partial<Producto>) => Promise<void>
  loading?: boolean
}

export function ProductForm({ initial, onSubmit, loading }: ProductFormProps) {
  const { data: categorias = [] } = useCategorias()
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [precio, setPrecio] = useState(initial?.precio.toString() ?? '')
  const [imagen, setImagen] = useState(initial?.imagen ?? '')
  const [categoriaId, setCategoriaId] = useState(initial?.categoriaId?.toString() ?? '')
  const [activo, setActivo] = useState(initial?.activo ?? true)
  const [destacado, setDestacado] = useState(initial?.destacado ?? false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      nombre,
      descripcion,
      precio: Number(precio),
      imagen,
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      activo,
      destacado,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Precio ($)</label>
        <input value={precio} onChange={e => setPrecio(e.target.value)} type="number" required className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">URL de imagen</label>
        <input value={imagen} onChange={e => setImagen(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">Sin categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <input id="activo" type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} className="rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500" />
          <label htmlFor="activo" className="text-sm text-gray-300">Activo</label>
        </div>
        <div className="flex items-center gap-2">
          <input id="destacado" type="checkbox" checked={destacado} onChange={e => setDestacado(e.target.checked)} className="rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500" />
          <label htmlFor="destacado" className="text-sm text-gray-300">Destacado</label>
        </div>
      </div>
      <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 disabled:opacity-50 transition-all">
        {loading ? 'Guardando...' : initial ? 'Actualizar producto' : 'Crear producto'}
      </button>
    </form>
  )
}
