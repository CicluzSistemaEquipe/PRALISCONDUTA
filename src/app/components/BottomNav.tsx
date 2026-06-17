import { motion } from 'framer-motion'
import { Home, MessageCircle, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// 'progress' permanece no tipo p/ compatibilidade (a tela de Progresso ainda
// existe e é acessível pelo anel da Lis no header), mas não é mais uma aba.
export type Tab = 'feed' | 'progress' | 'lis' | 'profile'

export const TAB_PATH: Record<Tab, string> = {
  feed: '/feed',
  progress: '/progresso',
  lis: '/lis',
  profile: '/perfil',
}

// Apenas 3 abas visíveis — o progresso individual interessa ao RH, não ao colaborador.
const NAV_ITEMS: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'feed', icon: Home, label: 'Início' },
  { id: 'lis', icon: MessageCircle, label: 'Lis' },
  { id: 'profile', icon: User, label: 'Perfil' },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-[480px] items-center justify-around"
      style={{
        background: isLight
          ? 'rgba(255,255,255,0.96)'
          : 'rgba(26,14,0,0.96)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid var(--nav-border)',
        boxShadow: isLight ? '0 -8px 40px rgba(94,55,49,0.10)' : '0 -8px 40px rgba(0,0,0,0.60)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        const I = item.icon
        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.82 }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex flex-col items-center gap-0.5 px-5 py-2"
            style={{ color: isActive ? 'var(--orange)' : isLight ? 'rgba(94,55,49,0.45)' : 'rgba(255,245,220,0.35)', transition: 'color 0.2s' }}
          >
            {isActive && (
              <motion.span
                layoutId="nav-bg"
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'rgba(243,116,53,0.12)', border: '1px solid rgba(243,116,53,0.22)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
            <I size={21} style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(243,116,53,0.80))' : 'none' }} />
            <span className="font-body text-[10px] font-semibold tracking-wide relative">{item.label}</span>
            {isActive && (
              <motion.span
                layoutId="nav-dot"
                className="rounded-full"
                style={{ height: 3, width: 22, background: 'var(--orange)', boxShadow: '0 0 12px rgba(243,116,53,0.90)' }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
