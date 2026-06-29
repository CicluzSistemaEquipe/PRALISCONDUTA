import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Loading } from '../components/Loading'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { hasRequiredOnboarding } from '@/lib/onboarding'
import { registrarEvento } from '@/lib/tracking'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const navigate         = useNavigate()
  const { resumeByToken } = useSession()
  const { theme }        = useTheme()
  const isLight          = theme === 'light'
  const ran              = useRef(false)

  // 'loading' → tentando auth | 'no-token' → sem ?t= | 'error' → token não encontrado
  const [status, setStatus] = useState<'loading' | 'no-token' | 'error'>('loading')

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = new URLSearchParams(window.location.search).get('t')
    if (!token) {
      setStatus('no-token')
      return
    }

    resumeByToken(token)
      .then((emp) => {
        if (!emp) { setStatus('error'); return }
        void registrarEvento({ tipo: 'login', colaboradorId: emp.id })
        // redireciona para onboarding (primeira vez) ou feed (já viu)
        navigate(hasRequiredOnboarding(emp.id) ? '/feed' : '/conheca?entry=1', { replace: true })
      })
      .catch(() => setStatus('error'))
  }, [resumeByToken, navigate])

  if (status === 'loading') return <Loading />

  const isNoToken = status === 'no-token'

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatedBackground accent="#b8860b" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center"
      >
        {/* logo */}
        <motion.img
          src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
          alt="Padaria Pralis"
          style={{ width: 120, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE, marginBottom: 28 }}
          animate={{ y: [0, -2, 0], scale: [1, 1.025, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* avatar da Lis */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
          style={{
            width: 80, height: 80,
            borderRadius: '50%', overflow: 'hidden',
            background: '#fff',
            border: '2px solid rgba(184,134,11,0.5)',
            boxShadow: '0 0 0 6px rgba(184,134,11,0.12), 0 12px 28px rgba(43,22,15,0.3)',
            marginBottom: 24,
          }}
        >
          <video
            src="/videocirculo-dashboard.mp4"
            autoPlay loop muted playsInline
            style={{ width: '130%', height: '130%', objectFit: 'cover', objectPosition: 'center 20%', marginLeft: '-2%', marginTop: '-10%' }}
          />
        </motion.div>

        {/* mensagem */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--stroke)',
            borderRadius: '8px 18px 18px 18px',
            padding: '16px 20px',
            maxWidth: 300,
            marginBottom: 20,
          }}
        >
          <p className="font-body leading-relaxed" style={{ fontStyle: 'italic', fontSize: 15, color: 'var(--text-secondary)' }}>
            {isNoToken
              ? 'Oi! Para acessar, use o link que o seu gestor enviou para você.'
              : 'Hmm… esse link não foi encontrado. Peça um novo link ao seu gestor.'}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-body text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {isNoToken ? 'Nenhum código de acesso detectado.' : 'Código inválido ou expirado.'}
        </motion.p>

        {/* Login alternativo: colaborador entra com os próprios dados (sem link) */}
        <motion.button
          type="button"
          onClick={() => navigate('/entrar')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          className="font-body"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 24, padding: '13px 22px', borderRadius: 999, fontSize: 14, fontWeight: 700,
            color: '#fff', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(110deg, #f37435 0%, #f37435 40%, #b8860b 55%, #f37435 70%)',
            boxShadow: '0 8px 24px rgba(243,116,53,0.35)',
          }}
        >
          <LogIn size={17} strokeWidth={2.2} /> Já sou colaborador
        </motion.button>
      </motion.div>
    </div>
  )
}
