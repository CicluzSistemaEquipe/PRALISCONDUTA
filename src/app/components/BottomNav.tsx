import { motion } from 'framer-motion'
import { House, UserRound } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// 'progress' e 'lis' permanecem no tipo por compatibilidade com rotas existentes
export type Tab = 'feed' | 'progress' | 'lis' | 'profile'

export const TAB_PATH: Record<Tab, string> = {
  feed:     '/feed',
  progress: '/progresso',
  lis:      '/perfil',   // redireciona para perfil
  profile:  '/perfil',
}

const NAV_ITEMS: { id: Tab; icon: typeof House; label: string }[] = [
  { id: 'feed',    icon: House,      label: 'Início' },
  { id: 'profile', icon: UserRound,  label: 'Perfil' },
]

/**
 * Rodapé moderno e leve, coeso com o topo escuro da Home.
 * Sem padrão de fundo nem loop infinito; o indicador ativo usa layout
 * animation (spring) — motion com propósito.
 */
export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-stretch justify-around"
      style={{
        background: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(21,9,0,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: `1px solid ${isLight ? 'rgba(94,55,49,0.12)' : 'rgba(243,116,53,0.18)'}`,
        boxShadow: isLight ? '0 -10px 30px rgba(94,55,49,0.10)' : '0 -12px 30px rgba(0,0,0,0.35)',
        padding: '8px 22px calc(var(--safe-bottom) + 8px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        const I = item.icon
        const idle = isLight ? '#9a8b7d' : 'rgba(255,255,255,0.55)'

        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.9 }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex min-w-[78px] flex-col items-center justify-center gap-1 pt-1"
            style={{ color: isActive ? '#f37435' : idle, transition: 'color 0.2s ease' }}
          >
            <span className="relative flex h-9 w-12 items-center justify-center rounded-[13px]">
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[13px]"
                  style={{ background: 'rgba(243,116,53,0.16)', border: '1px solid rgba(243,116,53,0.42)' }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                />
              )}
              <I size={21} strokeWidth={isActive ? 2.5 : 2} className="relative" />
            </span>
            <span
              className="font-body font-bold"
              style={{ fontSize: 10, letterSpacing: '0.02em', color: isActive ? '#f37435' : idle }}
            >
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
