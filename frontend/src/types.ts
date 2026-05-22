export interface Categoria {
  id: number
  nombre: string
  slug: string
  descripcion: string | null
  imagen: string | null
}

export interface ProductoImagen {
  id: number
  url: string
  orden: number
}

export interface Caracteristica {
  id: number
  nombre: string
  valor: string
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  sku: string | null
  precio: number
  imagen: string | null
  activo: boolean
  destacado: boolean
  stock: number
  categoriaId: number | null
  categoria: Categoria | null
  imagenes: ProductoImagen[]
  caracteristicas: Caracteristica[]
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    nombre: string
    email: string
    role: string
  }
}
