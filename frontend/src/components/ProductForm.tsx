import type { Producto } from '@/types'
import { useState, useRef, FormEvent } from 'react'
import { useCategorias } from '@/hooks/queries'
import { useToast } from '@/hooks/useToast'
import { api } from '@/api/client'
import { Upload, X, Loader } from 'lucide-react'

interface ProductFormProps {
  initial?: Producto
  onSubmit: (data: Partial<Producto>) => Promise<void>
  loading?: boolean
}

export function ProductForm({ initial, onSubmit, loading }: ProductFormProps) {
  const { data: categorias = [] } = useCategorias()
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [precio, setPrecio] = useState(initial?.precio.toString() ?? '')
  const [imagen, setImagen] = useState(initial?.imagen ?? '')
  const [categoriaId, setCategoriaId] = useState(initial?.categoriaId?.toString() ?? '')
  const [activo, setActivo] = useState(initial?.activo ?? true)
  const [destacado, setDestacado] = useState(initial?.destacado ?? false)
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0')
  const [uploading, setUploading] = useState(false)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    if (!token) return
    setUploading(true)
    try {
      const { url } = await api.uploadFile(file, token)
      setImagen(url)
    } catch {
      toast('error', 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      nombre,
      descripcion,
      precio: Number(precio),
      imagen,
      categoriaId: categoriaId ? Number(categoriaId) : null,
      activo,
      destacado,
      stock: Number(stock),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-base font-medium text-gray-200 mb-2">Nombre del producto</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          placeholder="Ej: Ryzen 7 7800X3D"
          className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
        />
      </div>

      <div>
        <label className="block text-base font-medium text-gray-200 mb-2">Descripción</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={4}
          placeholder="Ej: Procesador de última generación con 8 núcleos..."
          className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base font-medium text-gray-200 mb-2">Precio ($)</label>
          <input
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            type="number"
            required
            placeholder="0"
            className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-gray-200 mb-2">Stock disponible</label>
          <input
            value={stock}
            onChange={e => setStock(e.target.value)}
            type="number"
            min="0"
            placeholder="0"
            className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-200 mb-2">Imagen del producto</label>
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <input
              type="url"
              value={imagen}
              onChange={e => setImagen(e.target.value)}
              placeholder="o pegá una URL..."
              className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border border-cyan-500/20"
              >
                {uploading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Subiendo...' : 'Subir archivo'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
          {imagen && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-cyan-500/20 flex-shrink-0 group">
              <img src={imagen} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagen('')}
                className="absolute top-1 right-1 w-6 h-6 bg-red-900/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-200 mb-2">Categoría</label>
        <select
          value={categoriaId}
          onChange={e => setCategoriaId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/20 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Sin categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={e => setActivo(e.target.checked)}
            className="w-5 h-5 rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-base text-gray-200">Activo</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={destacado}
            onChange={e => setDestacado(e.target.checked)}
            className="w-5 h-5 rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
          />
          <span className="text-base text-gray-200">Destacado</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium text-base shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 disabled:opacity-50 transition-all"
      >
        {loading ? 'Guardando...' : initial ? 'Actualizar producto' : 'Crear producto'}
      </button>
    </form>
  )
}
