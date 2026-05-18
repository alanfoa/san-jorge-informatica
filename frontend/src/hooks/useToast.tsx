import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

interface ToastContext {
  toast: (type: 'success' | 'error', message: string) => void
}

const Ctx = createContext<ToastContext>({ toast: () => {} })

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <Ctx.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-slide-up ${
              t.type === 'success'
                ? 'bg-green-900/90 border-green-500/40 text-green-200'
                : 'bg-red-900/90 border-red-500/40 text-red-200'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            }
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
