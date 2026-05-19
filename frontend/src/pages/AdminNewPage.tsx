import type { Producto } from '@/types'
import { ProductForm } from '@/components/ProductForm'
import { useCreateProducto } from '@/hooks/queries'
import { useToast } from '@/hooks/useToast'

export function AdminNewPage() {
  const { toast } = useToast()
  const createProducto = useCreateProducto()
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')

  async function handleSubmit(data: Partial<Producto>) {
    try {
      await createProducto.mutateAsync({ data, token: token! })
      toast('success', 'Producto creado')
    } catch {
      toast('error', 'Error al crear producto')
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Nuevo producto</h1>
        <ProductForm onSubmit={handleSubmit} loading={createProducto.isPending} />
      </div>
    </div>
  )
}
