import type { Producto, Categoria, LoginResponse } from '@/types'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error de red' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

export const api = {
  login(email: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  getCategorias() {
    return request<Categoria[]>('/categorias')
  },

  getProductos() {
    return request<Producto[]>('/productos')
  },

  getProductosActivos() {
    return request<Producto[]>('/productos/activos')
  },

  getProducto(id: number) {
    return request<Producto>(`/productos/${id}`)
  },

  createProducto(data: Partial<Producto>, token: string) {
    return request<Producto>('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    })
  },

  updateProducto(id: number, data: Partial<Producto>, token: string) {
    return request<Producto>(`/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    })
  },

  deleteProducto(id: number, token: string) {
    return request<{ success: boolean }>(`/productos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
  },

  createCategoria(data: Partial<Categoria>, token: string) {
    return request<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    })
  },

  updateCategoria(id: number, data: Partial<Categoria>, token: string) {
    return request<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: authHeaders(token),
    })
  },

  deleteCategoria(id: number, token: string) {
    return request<{ success: boolean }>(`/categorias/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
  },

  getMercadoPagoStatus() {
    return request<{ configured: boolean; testMode: boolean }>('/mercadopago/status')
  },

  createMercadoPagoPreference(items: { title: string; quantity: number; unit_price: number }[]) {
    return request<{ id: string; init_point: string; test_mode: boolean }>('/mercadopago/create-preference', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  },

  async uploadFile(file: File, token: string) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error al subir imagen' }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    return res.json() as Promise<{ url: string }>
  },

  syncInvid(token: string) {
    return request<{ created: number; updated: number; skipped: number; scraped: number; message: string; duration: string }>('/admin/sync-invid', {
      method: 'POST',
      headers: authHeaders(token),
    })
  },
}
