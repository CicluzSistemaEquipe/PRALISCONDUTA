import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { useTheme } from '../context/ThemeContext'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { findEmployeeByCredentials } from '@/lib/storage'
import { normalizeCPF } from '@/lib/normalize'
import { hasRequiredOnboarding } from '@/lib/onboarding'
import { registrarEvento } from '@/lib/tracking'

/** Mascara CPF para exibicao no input (nao persiste o mascarado). */
function maskCPF(v: string): string {
  const d = normalizeCPF(v).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

/**
 * Login alternativo do colaborador (sem link): nome + CPF (+ loja opcional).
 * Rota publica `/entrar`. NUNCA acessa /admin. Recupera o progresso salvo.
 */
export default function EntrarColaborador() {
  const navigate = useNavigate()
  const { resumeByToken } = useSession()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [store, setStore] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'not-found'>('idle')

  const cpfDigits = normalizeCPF(cpf)
  const canSubmit = name.trim().length >= 2 && cpfDigits.length === 11

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || status === 'loading') return
    setStatus('loading')
    try {
      const emp = await findEmployeeByCredentials({ name, cpf, store })
      if (!emp) {
        setStatus('not-found')
        return
      }
      await resumeByToken(emp.token)
      void registrarEvento({ tipo: 'login', colaboradorId: emp.id })
      navigate(hasRequiredOnboarding(emp.id) ? '/feed' : '/conheca?entry=1', { replace: true })
    } catch {
      setStatus('not-found')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--glass-bg)',
    border: '1.5px solid var(--stroke)',
    borderRadius: 12,
    padding: '12px 14px',
    color: 'var(--text-primary)',
    fontSize: 15,
    outline: 'none',
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatedBackground accent="#b8860b" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-1 flex-col justify-center px-7"
        style={{ paddingTop: 'calc(var(--safe-top) + 24px)', paddingBottom: 24, maxWidth: 440, margin: '0 auto', width: '100%' }}
      >
        <img
          src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
          alt="Padaria Pralis"
          style={{ width: 96, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE, marginBottom: 22 }}
        />

        <h1 className="font-display" style={{ fontSize: 26, lineHeight: 1.15, color: 'var(--text-primary)' }}>
          Entrar com meus dados
        </h1>
        <p className="font-body" style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, marginBottom: 22, lineHeight: 1.5 }}>
          Use os mesmos dados do seu cadastro para voltar ao seu treinamento.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="ec-nome" className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Nome completo
            </label>
            <input
              id="ec-nome" autoFocus autoComplete="name"
              value={name} onChange={(e) => { setName(e.target.value); setStatus('idle') }}
              placeholder="Como no cadastro" style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="ec-cpf" className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              CPF
            </label>
            <input
              id="ec-cpf" inputMode="numeric" autoComplete="off"
              value={cpf} onChange={(e) => { setCpf(maskCPF(e.target.value)); setStatus('idle') }}
              placeholder="000.000.000-00" style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="ec-loja" className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Loja <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(se souber)</span>
            </label>
            <input
              id="ec-loja" autoComplete="off"
              value={store} onChange={(e) => { setStore(e.target.value); setStatus('idle') }}
              placeholder="Ex.: Vila Nova" style={inputStyle}
            />
          </div>

          <div aria-live="polite" style={{ minHeight: 20 }}>
            {status === 'not-found' && (
              <p className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger)' }}>
                Cadastro nao encontrado. Fale com seu gerente.
              </p>
            )}
          </div>

          <motion.button
            type="submit" disabled={!canSubmit || status === 'loading'}
            whileTap={{ scale: 0.98 }}
            className="font-body"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px', borderRadius: 999, fontSize: 15, fontWeight: 700,
              color: '#fff', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5,
              background: 'linear-gradient(110deg, #f37435 0%, #f37435 40%, #b8860b 55%, #f37435 70%)',
            }}
          >
            {status === 'loading' ? 'Entrando...' : <>Entrar <ArrowRight size={18} strokeWidth={2.2} /></>}
          </motion.button>
        </form>

        <button
          type="button" onClick={() => navigate('/login')}
          className="font-body"
          style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
        >
          <ArrowLeft size={15} /> Tenho um link de acesso
        </button>
      </motion.div>
    </div>
  )
}
