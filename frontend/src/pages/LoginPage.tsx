import { useState, FormEvent } from 'react'
import { useLogin } from '@/hooks/queries'

export function LoginPage() {
  const login = useLogin()
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(true)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await login.mutateAsync({
        email: form.get('email') as string,
        password: form.get('password') as string,
        remember,
      })
    } catch {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-white mb-6 text-center">Administración</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500" placeholder="admin@sanjorge.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input name="password" type="password" required className="w-full px-3 py-2 bg-gray-900 border border-cyan-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-cyan-500/30 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-400">Recordar sesión</span>
          </label>
          <button type="submit" disabled={login.isPending} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 transition-all">
            {login.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
