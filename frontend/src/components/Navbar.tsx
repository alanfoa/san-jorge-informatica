import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { WHATSAPP } from '@/lib/constants'
import { useCart } from '@/hooks/useCart'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { totalItems } = useCart()

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Catálogo' },
    { to: '/#categorias', label: 'Categorías' },
    { to: '/#como-comprar', label: 'Cómo Comprar' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/80 transition-all">
              <span className="text-white font-bold text-xl">SJ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none tracking-tight">
                SAN JORGE
              </span>
              <span className="text-cyan-400 text-xs uppercase tracking-widest">
                Informática
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => {
              if (link.to.startsWith('/#')) {
                return (
                  <a
                    key={link.to}
                    href={link.to}
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide"
                  >
                    {link.label}
                  </a>
                )
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    location.pathname === link.to
                      ? 'text-cyan-400'
                      : 'text-gray-300 hover:text-cyan-400'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/carrito"
              className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all"
            >
              Contacto Directo
            </a>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/carrito"
              className="relative p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-cyan-500/20">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navLinks.map(link => {
              const closeAndScroll = () => {
                setIsOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              if (link.to.startsWith('/#')) {
                return (
                  <a
                    key={link.to}
                    href={link.to}
                    className="block px-3 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              }
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-3 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                  onClick={closeAndScroll}
                >
                  {link.label}
                </Link>
              )
            })}
            <a
              href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium text-center shadow-lg shadow-cyan-500/50 mt-4"
            >
              Contacto Directo
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
