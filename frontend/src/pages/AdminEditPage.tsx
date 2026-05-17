import { useParams, useNavigate } from 'react-router-dom'
import type { Producto } from '@/types'
import { ProductForm } from '@/components/ProductForm'
import { useProducto, useUpdateProducto } from '@/hooks/queries'

export function AdminEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productoId = id ? Number(id) : undefined
  const { data: producto, isLoading } = useProducto(productoId)
  const updateProducto = useUpdateProducto()
  const token = localStorage.getItem('admin_token')

  if (!id) return null

  async function handleSubmit(data: Partial<Producto>) {
    try {
      await updateProducto.mutateAsync({ id: Number(id), data, token: token! })
    } catch {
      alert('Error al actualizar')
    }
  }

  if (isLoading) return <div className="min-h-screen bg-black pt-20 flex items-center justify-center"><p className="text-gray-400">Cargando...</p></div>
  if (!producto) {
    navigate('/admin')
    return null
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Editar producto</h1>
        <ProductForm initial={producto} onSubmit={handleSubmit} loading={updateProducto.isPending} />
      </div>
    </div>
  )
}
