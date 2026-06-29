import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { PralisSymbol } from '@/app/components/PralisSymbol'
import { adminLogin, isAdminAuthed } from '../auth'
import '../admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isAdminAuthed()) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const ok = password ? adminLogin(email, password) : adminLogin(email.trim())
    if (ok) navigate('/admin/dashboard', { replace: true })
    else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="adm-root flex min-h-[100dvh] items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <form
          onSubmit={submit}
          className={`rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)] ${error ? 'adm-shake' : ''}`}
          onAnimationEnd={() => error && setError(false)}
        >
          <div className="mb-7 flex flex-col items-center text-center">
            <PralisSymbol size={40} colorA="#5e3731" colorB="#f37435" animate={false} />
            <h1 className="adm-h1 mt-4 text-[1.35rem]">Painel Pralís</h1>
            <p className="mt-1 text-[0.875rem] text-[var(--text-muted)]">Acesso de Donos e Gerentes</p>
          </div>

          <label className="adm-label" htmlFor="adm-email">E-mail</label>
          <div className="relative mb-3">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input
              id="adm-email"
              type="email"
              autoFocus
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@pralis.com.br"
              className="adm-input"
              style={{ paddingLeft: 38 }}
            />
          </div>

          <label className="adm-label" htmlFor="adm-pass">Senha</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input
              id="adm-pass"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="adm-input"
              style={{ paddingLeft: 38, paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPass}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
            >
              {showPass ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.8} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />}
            </button>
          </div>

          <div className="min-h-[20px] pt-1.5" aria-live="polite">
            {error && (
              <p className="text-[0.78rem] font-medium text-[var(--danger)]">
                Credenciais inválidas. Tente novamente.
              </p>
            )}
          </div>

          <button type="submit" className="adm-btn adm-btn--primary mt-2 w-full">
            Entrar <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>

          {import.meta.env.DEV && (
            <p className="mt-5 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5 text-center text-[0.72rem] leading-relaxed text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-secondary)]">Demo:</span>{' '}
              dono@pralis.com.br · senha <span className="font-semibold text-[var(--text-secondary)]">pralis2024</span>
            </p>
          )}
        </form>

        <p className="mt-5 text-center text-[0.75rem] italic text-[var(--text-muted)]">
          é provar e ser feliz
        </p>
      </motion.div>
    </div>
  )
}
