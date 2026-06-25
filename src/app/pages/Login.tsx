import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ROLES, type Role } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { fadeUp, staggerChildren } from '@/lib/animations'
import { useTheme } from '../context/ThemeContext'
import { hasRequiredOnboarding } from '@/lib/onboarding'

function getTokenFromUrl(): string | undefined {
  const params = new URLSearchParams(window.location.search)
  return params.get('t') ?? undefined
}

const inputStyle: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--stroke)',
  borderRadius: 16,
  padding: '14px 16px',
  color: 'var(--text-primary)',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 15,
  outline: 'none',
  width: '100%',
}

const inputFocusStyle: React.CSSProperties = {
  border: '1px solid #f37435',
  boxShadow: '0 0 0 3px rgba(243,116,53,0.16)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
      <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </motion.div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useSession()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role) {
      setError('Preencha seu nome e cargo para começar.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const employee = await login({ name: name.trim(), phone: phone.trim(), role: role as Role, token: getTokenFromUrl() })
      navigate(hasRequiredOnboarding(employee.id) ? '/feed' : '/conheca?entry=1', { replace: true })
    } catch {
      setError('Algo deu errado. Tente novamente.')
      setBusy(false)
    }
  }

  const fs = (id: string) => (focused === id ? { ...inputStyle, ...inputFocusStyle } : inputStyle)

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatedBackground accent="#b8860b" />

      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 flex-col px-6 pb-10"
        style={{ paddingTop: 'calc(var(--safe-top) + 2.5rem)' }}
      >
        <motion.div variants={fadeUp} className="mb-8 flex flex-col items-center gap-4">
          <motion.img
            src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
            alt="Padaria Pralis"
            style={{ width: 132, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE, transformOrigin: 'center' }}
            animate={{ y: [0, -2, 0], scale: [1, 1.025, 1] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{ height: 2, width: 58, background: '#b8860b', borderRadius: 2, opacity: 0.7 }}
            animate={{ width: [42, 72, 42], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="mb-8 flex items-start gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          >
            <div
              aria-label="Lis"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#ffffff',
                border: '2px solid rgba(184,134,11,0.55)',
                boxShadow: '0 0 0 5px rgba(184,134,11,0.14), 0 10px 22px rgba(43,22,15,0.24)',
                flexShrink: 0,
              }}
            >
              <video
                src="/videocirculo-dashboard.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '130%',
                  height: '130%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  marginLeft: '-2%',
                  marginTop: '-10%',
                  display: 'block',
                }}
              />
            </div>
          </motion.div>
          <div
            style={{
              flex: 1,
              background: 'var(--glass-bg)',
              border: '1px solid var(--stroke)',
              borderRadius: '8px 18px 18px 18px',
              padding: '14px 16px',
            }}
          >
            <p className="font-body leading-relaxed" style={{ fontStyle: 'italic', fontSize: 15, color: 'var(--text-secondary)' }}>
              Que bom ter você aqui! Bora fazer seu cadastro?
            </p>
          </div>
        </motion.div>

        <motion.form variants={staggerChildren} onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Nome completo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused('')}
              placeholder="Como você se chama?"
              style={fs('name')}
            />
          </Field>

          <Field label="WhatsApp (opcional)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              inputMode="tel"
              placeholder="(00) 00000-0000"
              style={fs('phone')}
            />
          </Field>

          <Field label="Seu cargo">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              onFocus={() => setFocused('role')}
              onBlur={() => setFocused('')}
              style={{
                ...fs('role'),
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(184,134,11,0.85)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
              }}
            >
              <option value="" disabled style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                Selecione...
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {r}
                </option>
              ))}
            </select>
            <span className="font-body" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Seu cargo define os módulos que você vai ver.
            </span>
          </Field>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-body text-sm" style={{ color: '#f87171' }}>
              {error}
            </motion.p>
          )}

          <motion.button variants={fadeUp} type="submit" disabled={busy} className="btn-laranja mt-2 w-full">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Começar minha jornada <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}
