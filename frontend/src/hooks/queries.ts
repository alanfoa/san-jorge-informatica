import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Producto, Categoria } from '@/types'
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
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductosActivos() {
  return useQuery({
    queryKey: ['productos', 'activos'],
    queryFn: api.getProductosActivos,
    staleTime: 5 * 60 * 1000,
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
    mutationFn: ({ email, password, remember }: { email: string; password: string; remember?: boolean }) =>
      api.login(email, password).then(res => {
        const storage = remember !== false ? localStorage : sessionStorage
        storage.setItem('admin_token', res.access_token)
        return res
      }),
    onSuccess: () => {
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

export function useCreateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, token }: { data: Partial<Categoria>; token: string }) =>
      api.createCategoria(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data, token }: { id: number; data: Partial<Categoria>; token: string }) =>
      api.updateCategoria(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      api.deleteCategoria(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}
