import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ROLES, type Role } from '@/lib/types'
import { useSession } from '../context/SessionContext'
import { LisAvatar } from '../components/LisAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { brand } from '@/lib/brand'
import { fadeUp, staggerChildren } from '@/lib/animations'

function getTokenFromUrl(): string | undefined {
  const params = new URLSearchParams(window.location.search)
  return params.get('t') ?? undefined
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(184,134,11,0.25)',
  borderRadius: 14,
  padding: '14px 16px',
  color: '#fff',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: 15,
  outline: 'none',
  width: '100%',
}

const inputFocusStyle: React.CSSProperties = {
  border: '1px solid #f37435',
  boxShadow: '0 0 0 3px rgba(243,116,53,0.15)',
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
      <label
        className="font-body font-semibold"
        style={{ fontSize: 13, color: 'rgba(232,207,160,0.85)' }}
      >
        {label}
      </label>
      {children}
    </motion.div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useSession()
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
      await login({ name: name.trim(), phone: phone.trim(), role: role as Role, token: getTokenFromUrl() })
      navigate('/feed', { replace: true })
    } catch {
      setError('Algo deu errado. Tente novamente.')
      setBusy(false)
    }
  }

  const fs = (id: string) => (focused === id ? { ...inputStyle, ...inputFocusStyle } : inputStyle)

  return (
    <div className="app-shell" style={{ background: '#000', position: 'relative' }}>
      {/* Fundo: glow dourado no topo + padrão de espigas */}
      <AnimatedBackground accent="#b8860b" theme="dark" />
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184,134,11,0.30) 0%, rgba(0,0,0,0) 65%)',
        }}
      />

      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 flex-col px-6 pb-10"
        style={{ paddingTop: 'calc(var(--safe-top) + 2.5rem)' }}
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 mb-8">
          <img src={brand.logoBege} alt="Padaria Pralís" className="h-12 w-auto" />
          <div
            style={{ height: 1, width: 48, background: 'linear-gradient(90deg, transparent, rgba(184,134,11,0.6), transparent)' }}
          />
        </motion.div>

        {/* Lis + balão de fala */}
        <motion.div variants={fadeUp} className="flex items-start gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          >
            <LisAvatar state="talking" size={60} />
          </motion.div>
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(184,134,11,0.30)',
              borderRadius: '4px 16px 16px 16px',
              padding: '14px 16px',
            }}
          >
            <p
              className="font-body leading-relaxed"
              style={{ fontStyle: 'italic', fontSize: 15, color: '#e8cfa0' }}
            >
              Que bom ter você aqui! Bora fazer seu cadastro? 🌾
            </p>
          </div>
        </motion.div>

        {/* Formulário */}
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
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(184,134,11,0.7)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
              }}
            >
              <option value="" disabled style={{ background: '#1a0f0c', color: '#888' }}>
                Selecione…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r} style={{ background: '#1a0f0c', color: '#fff' }}>
                  {r}
                </option>
              ))}
            </select>
            <span
              className="font-body"
              style={{ fontSize: 11, color: 'rgba(232,207,160,0.45)', marginTop: 2 }}
            >
              Seu cargo define os módulos que você vai ver.
            </span>
          </Field>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-body text-sm"
              style={{ color: '#f87171' }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            variants={fadeUp}
            type="submit"
            disabled={busy}
            className="btn-laranja mt-2 w-full"
          >
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
