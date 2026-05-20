import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Producto } from '@/types'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartContext {
  items: CartItem[]
  addItem: (producto: Producto) => void
  removeItem: (productoId: number) => void
  updateQuantity: (productoId: number, cantidad: number) => void
  clearCart: () => void
  totalItems: number
}

const STORAGE_KEY = 'sanjorge-cart'

const Ctx = createContext<CartContext>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
})

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((producto: Producto) => {
    setItems(prev => {
      const existing = prev.find(i => i.producto.id === producto.id)
      if (existing) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }, [])

  const removeItem = useCallback((productoId: number) => {
    setItems(prev => prev.filter(i => i.producto.id !== productoId))
  }, [])

  const updateQuantity = useCallback((productoId: number, cantidad: number) => {
    if (cantidad < 1) return
    setItems(prev =>
      prev.map(i =>
        i.producto.id === productoId ? { ...i, cantidad } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <Ctx.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  return useContext(Ctx)
}
