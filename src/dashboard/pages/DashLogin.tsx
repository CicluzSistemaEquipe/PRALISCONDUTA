import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { dashLogin } from '../auth'
import { hasSupabase } from '@/lib/supabase'
import { brand } from '@/lib/brand'

export default function DashLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const ok = await dashLogin(email, password)
    if (ok) navigate('/dashboard', { replace: true })
    else {
      setError('Credenciais inválidas.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pralis-radial px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-card border border-pralis-marrom-lk bg-pralis-marrom-dk/70 p-8 shadow-pralis-card"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src={brand.logoBege} alt="Padaria Pralís" className="h-11 w-auto" />
          <p className="font-body text-xs uppercase tracking-widest text-pralis-creme/60">
            Painel do RH
          </p>
        </div>

        <label className="mb-1 block font-body text-sm font-semibold text-pralis-creme">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-pralis-marrom-lk bg-pralis-marrom/60 px-4 py-3 font-body text-pralis-branco focus:border-pralis-laranja focus:outline-none"
          placeholder="rh@pralis.com.br"
        />

        <label className="mb-1 block font-body text-sm font-semibold text-pralis-creme">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-pralis-marrom-lk bg-pralis-marrom/60 px-4 py-3 font-body text-pralis-branco focus:border-pralis-laranja focus:outline-none"
          placeholder="••••••••"
        />

        {error && <p className="mb-3 font-body text-sm text-pralis-vermelho">{error}</p>}

        <button type="submit" disabled={busy} className="btn-laranja w-full">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
        </button>

        {!hasSupabase && import.meta.env.DEV && (
          <p className="mt-4 text-center font-body text-xs text-pralis-creme/50">
            Modo demo — use qualquer e-mail e a senha <strong>pralis</strong>.
          </p>
        )}
      </form>
    </div>
  )
}
