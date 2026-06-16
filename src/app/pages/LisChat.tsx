import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { modulesForRole } from '@/lib/content'
import { useSession } from '../context/SessionContext'
import { LisAvatar } from '../components/LisAvatar'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { BottomNav, TAB_PATH } from '../components/BottomNav'
import { useTheme } from '../context/ThemeContext'

export default function LisChat() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { employee, progress } = useSession()

  const tip = useMemo(() => {
    if (!employee) return null
    const mods = modulesForRole(employee.role)
    const next = mods.find((m) => m.kind !== 'signature' && !progress[m.id]?.completed)
    return next ?? null
  }, [employee, progress])

  if (!employee) return null
  const first = employee.name.split(' ')[0]

  return (
    <div className="app-shell">
      <AnimatedBackground accent="#b8860b" />

      <main className="no-scrollbar relative z-10 flex flex-1 flex-col items-center justify-start gap-5 overflow-y-auto px-6 pb-28 pt-5 text-center">
        {/* glow ambiental atrás do avatar */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(184,134,11,0.10) 0%, rgba(243,116,53,0.05) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(184,134,11,0.22) 0%, rgba(243,116,53,0.10) 45%, transparent 70%)',
            filter: 'blur(32px)',
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -65%)',
          }}
        />

        {/* saudação acima do avatar */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-body uppercase tracking-widest"
          style={{ fontSize: 10, color: 'rgba(184,134,11,0.80)', letterSpacing: '0.24em' }}
        >
          sua guia de jornada
        </motion.p>

        {/* Lis corpo inteiro (PNG real) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <LisAvatar state="talking" size={180} />
        </motion.div>

        {/* nome da Lis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="-mt-2 text-center"
        >
          <p style={{ fontFamily: 'MadeByDillan, serif', fontSize: 22, color: isLight ? 'var(--text-primary)' : '#fff', lineHeight: 1 }}>Lis</p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.55)', marginTop: 2 }}>
            Assistente de Aprendizado · Pralís
          </p>
        </motion.div>

        {/* balloon */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
          className="w-full px-5 py-5"
          style={{
            background: isLight
              ? 'linear-gradient(135deg, rgba(232,207,160,0.35) 0%, rgba(255,248,235,0.75) 100%)'
              : 'linear-gradient(135deg, rgba(184,134,11,0.28) 0%, rgba(94,55,49,0.22) 100%)',
            border: '1px solid rgba(184,134,11,0.35)',
            borderRadius: '6px 22px 22px 22px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: isLight ? 'var(--shadow-card)' : '0 12px 48px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          <p className="font-body" style={{ fontSize: 16, fontStyle: 'italic', lineHeight: 1.72, color: isLight ? 'var(--text-primary)' : '#ffffff' }}>
            Oi, {first}! Eu sou a Lis e tô aqui pra te acompanhar. Qualquer dúvida sobre o nosso Código,
            é só seguir os módulos no seu ritmo. 💛
          </p>
        </motion.div>

        {/* próximo módulo */}
        {tip && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 22 }}
            className="w-full"
          >
            <p
              className="mb-2 font-body uppercase tracking-widest text-left"
              style={{ fontSize: 10, color: 'rgba(184,134,11,0.70)', letterSpacing: '0.18em' }}
            >
              próximo passo
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => navigate(`/modulo/${tip.id}`)}
              className="relative flex w-full items-center gap-3 overflow-hidden text-left"
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: isLight
                  ? 'linear-gradient(135deg, rgba(243,116,53,0.15) 0%, rgba(255,248,235,0.80) 100%)'
                  : 'linear-gradient(135deg, rgba(243,116,53,0.22) 0%, rgba(184,134,11,0.14) 100%)',
                border: '1px solid rgba(243,116,53,0.38)',
                boxShadow: isLight ? 'var(--shadow-card)' : '0 4px 24px rgba(243,116,53,0.14), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-xl"
                style={{ width: 40, height: 40, background: 'rgba(243,116,53,0.22)', border: '1px solid rgba(243,116,53,0.35)' }}
              >
                <ArrowRight size={18} color="#f37435" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display" style={{ fontSize: 15, lineHeight: 1.2, color: isLight ? 'var(--text-primary)' : '#fff' }}>
                  {tip.title}
                </span>
                <span className="block font-body" style={{ fontSize: 11, color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.65)', marginTop: 2 }}>
                  {tip.subtitle} · {tip.estimatedMinutes} min
                </span>
              </span>
              <ArrowRight size={16} color="rgba(243,116,53,0.7)" />
            </motion.button>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/feed')}
          className="btn-ghost w-full"
        >
          Ver todos os módulos
        </motion.button>
      </main>

      <BottomNav active="lis" onChange={(t) => navigate(TAB_PATH[t])} />
    </div>
  )
}
