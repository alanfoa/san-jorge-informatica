import { MapPin, Phone, Mail, Camera, Globe } from 'lucide-react'
import { WHATSAPP } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-black border-t border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <span className="text-white font-bold text-xl">SJ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">
                  SAN JORGE
                </span>
                <span className="text-cyan-400 text-xs uppercase tracking-widest">
                  Informática
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hardware premium de alto rendimiento. Atención personalizada y
              asesoramiento técnico especializado.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Inicio</a>
              </li>
              <li>
                <a href="/productos" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Catálogo Completo</a>
              </li>
              <li>
                <a href="/#categorias" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Categorías</a>
              </li>
              <li>
                <a href="/#como-comprar" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Cómo Comprar</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>Ituzaingó, Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <a href={`https://wa.me/${WHATSAPP}?text=Hola%2C%20quer%C3%ADa%20consultar%20por%20sus%20productos`} className="hover:text-cyan-400 transition-colors">
                  +54 9 11 3607-5731
                </a>
              </li>
              <li className="flex items-start space-x-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:sanjorgeinf@hotmail.com" className="hover:text-cyan-400 transition-colors">
                  sanjorgeinf@hotmail.com
                </a>
              </li>
            </ul>

            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-9 h-9 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all hover:scale-110">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all hover:scale-110">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} San Jorge Informática. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
