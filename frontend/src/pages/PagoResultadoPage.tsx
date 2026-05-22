import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react'

type EstadoPago = 'approved' | 'pending' | 'rejected' | 'unknown'

function parseEstado(params: URLSearchParams): EstadoPago {
  const status = params.get('collection_status') || params.get('status')
  if (status === 'approved') return 'approved'
  if (status === 'pending' || status === 'in_process') return 'pending'
  if (status === 'rejected' || status === 'failure') return 'rejected'
  return 'unknown'
}

const MENSAJES: Record<EstadoPago, { titulo: string; texto: string; icon: typeof CheckCircle; color: string }> = {
  approved: {
    titulo: '¡Pago aprobado!',
    texto: 'Tu pago fue procesado correctamente. Te contactaremos para coordinar la entrega.',
    icon: CheckCircle,
    color: 'text-green-400',
  },
  pending: {
    titulo: 'Pago pendiente',
    texto: 'Tu pago está en proceso. Te avisaremos cuando se confirme.',
    icon: Clock,
    color: 'text-yellow-400',
  },
  rejected: {
    titulo: 'Pago no realizado',
    texto: 'El pago no se completó. Podés intentar de nuevo desde el carrito.',
    icon: XCircle,
    color: 'text-red-400',
  },
  unknown: {
    titulo: 'Resultado del pago',
    texto: 'Volviste desde Mercado Pago. Si tenés dudas sobre tu pedido, consultanos por WhatsApp.',
    icon: Clock,
    color: 'text-cyan-400',
  },
}

export function PagoResultadoPage() {
  const [params] = useSearchParams()
  const estado = parseEstado(params)
  const { titulo, texto, icon: Icon, color } = MENSAJES[estado]

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <Icon className={`w-20 h-20 mx-auto mb-6 ${color}`} />
        <h1 className="text-3xl font-bold text-white mb-4">{titulo}</h1>
        <p className="text-gray-400 mb-8">{texto}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {estado === 'rejected' && (
            <Link
              to="/carrito"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium"
            >
              Volver al carrito
            </Link>
          )}
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/10 rounded-xl font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
