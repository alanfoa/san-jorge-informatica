import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Producto } from '@/types'
import { useNavigate } from 'react-router-dom'

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: api.getCategorias,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: api.getProductos,
    staleTime: 30 * 1000,
  })
}

export function useProductosActivos() {
  return useQuery({
    queryKey: ['productos', 'activos'],
    queryFn: api.getProductosActivos,
    staleTime: 30 * 1000,
  })
}

export function useProducto(id: number | undefined) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => api.getProducto(id!),
    enabled: !!id,
  })
}

export function useLogin() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (res) => {
      localStorage.setItem('admin_token', res.access_token)
      navigate('/admin')
    },
  })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ data, token }: { data: Partial<Producto>; token: string }) =>
      api.createProducto(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      navigate('/admin')
    },
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: Partial<Producto>; token: string }) =>
      api.updateProducto(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['productos', id] })
      navigate('/admin')
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      api.deleteProducto(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
