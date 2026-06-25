import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { AnimatedBackground } from '@/app/components/AnimatedBackground'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { adminLogin, isAdminAuthed } from '../auth'
import '../admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  // já logado → vai direto pro painel
  useEffect(() => {
    if (isAdminAuthed()) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    // email + senha; ou senha legada digitada no campo de email (sem senha)
    const ok = password ? adminLogin(email, password) : adminLogin(email.trim())
    if (ok) {
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="adm-root relative flex min-h-[100dvh] items-center justify-center px-5">
      <AnimatedBackground accent="#b8860b" theme="dark" />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`adm-card adm-card--gold relative z-10 w-full max-w-[380px] p-8 ${error ? 'adm-shake' : ''}`}
        onAnimationEnd={() => error && setError(false)}
      >
        <div className="mb-6 flex flex-col items-center gap-4">
          <div
            className="adm-pulse-gold flex h-[88px] w-[88px] items-center justify-center rounded-[24px]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(243,116,53,0.35), transparent 60%), rgba(255,245,220,0.07)',
              border: '1px solid rgba(184,134,11,0.35)',
            }}
          >
            <img src={brand.simboloEspiga} alt="" className="h-12 w-auto" style={{ filter: FILTER_WHITE }} />
          </div>
          <div className="text-center">
            <h1 className="adm-h1 text-2xl">Pralís · Admin</h1>
            <p className="mt-1 text-sm text-[var(--cream-muted)]">Painel de gestão</p>
          </div>
        </div>

        <label className="adm-label" htmlFor="adm-email">
          E-mail
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-muted)]" />
          <input
            id="adm-email"
            type="email"
            autoFocus
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@pralis.com.br"
            className="adm-input"
            style={{ paddingLeft: 40 }}
          />
        </div>

        <label className="adm-label mt-3" htmlFor="adm-pass">
          Senha
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cream-muted)]" />
          <input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="adm-input"
            style={{ paddingLeft: 40 }}
          />
        </div>

        <div className="h-5">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-xs font-semibold text-[#e2604f]"
            >
              Credenciais inválidas. Tente novamente.
            </motion.p>
          )}
        </div>

        <button type="submit" className="adm-btn adm-btn--primary mt-3 w-full">
          Entrar <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-5 text-center text-[0.7rem] text-[var(--text-locked)]">
          Acesso restrito a Donos e Gerentes
        </p>

        {import.meta.env.DEV && (
          <div
            className="mt-4 rounded-xl p-3 text-[0.68rem] leading-relaxed text-[var(--cream-muted)]"
            style={{ background: 'rgba(255,245,220,0.05)', border: '1px solid rgba(184,134,11,0.20)' }}
          >
            <strong className="text-[var(--cream)]">Demo:</strong> dono@pralis.com.br ou gerente@pralis.com.br
            (senha 4+ chars). Legado: digite <strong>pralis2024</strong> no e-mail, sem senha.
          </div>
        )}
      </motion.form>
    </div>
  )
}
