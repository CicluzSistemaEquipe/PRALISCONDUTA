import { motion } from 'framer-motion'
import { House, MessagesSquare, UserRound } from 'lucide-react'
import { brand } from '@/lib/brand'
import { useTheme } from '../context/ThemeContext'

// 'progress' permanece no tipo por compatibilidade. A tela ainda existe e e acessivel pelo avatar da Lis no header.
export type Tab = 'feed' | 'progress' | 'lis' | 'profile'

export const TAB_PATH: Record<Tab, string> = {
  feed: '/feed',
  progress: '/progresso',
  lis: '/lis',
  profile: '/perfil',
}

const NAV_ITEMS: { id: Tab; icon: typeof House; label: string }[] = [
  { id: 'feed', icon: House, label: 'Inicio' },
  { id: 'lis', icon: MessagesSquare, label: 'Lis' },
  { id: 'profile', icon: UserRound, label: 'Perfil' },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-center justify-around"
      style={{
        minHeight: 70,
        backgroundImage: `linear-gradient(135deg, ${isLight ? 'rgba(243,116,53,0.68)' : 'rgba(139,63,35,0.68)'} 0%, rgba(94,55,49,0.70) 52%, rgba(243,116,53,0.58) 100%), url(${brand.padraoFundo})`,
        backgroundSize: 'cover, 64px 86px',
        backgroundRepeat: 'no-repeat, repeat',
        backgroundBlendMode: 'normal, soft-light',
        borderTop: '1px solid rgba(255,255,255,0.22)',
        boxShadow: isLight ? '0 -14px 34px rgba(94,55,49,0.16)' : '0 -16px 36px rgba(43,22,15,0.34)',
        padding: '8px 18px calc(var(--safe-bottom) + 8px)',
        backdropFilter: 'blur(24px) saturate(1.42)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.42)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        const I = item.icon

        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.86 }}
            whileHover={{ y: -2 }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex min-w-[72px] flex-col items-center gap-1"
            style={{
              color: isActive ? '#f37435' : '#ffe6b8',
              transition: 'color 0.2s ease',
            }}
          >
            <span
              className="relative flex items-center justify-center"
              style={{
                width: 42,
                height: 34,
                borderRadius: 14,
                background: isActive ? '#ffffff' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${isActive ? '#ffffff' : 'rgba(255,255,255,0.24)'}`,
                boxShadow: isActive ? '0 10px 24px rgba(255,255,255,0.20)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-glow"
                  className="absolute inset-0 rounded-[14px]"
                  style={{ boxShadow: '0 8px 22px rgba(243,116,53,0.28)' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <motion.span
                animate={isActive ? { y: [0, -2, 0], rotate: [0, -2, 2, 0] } : { y: 0, rotate: 0 }}
                transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
              >
                <I size={20} strokeWidth={2.4} />
              </motion.span>
            </span>
            <span className="relative font-body text-[10px] font-bold tracking-wide" style={{ color: isActive ? '#ffffff' : '#ffe6b8' }}>
              {item.label}
            </span>
            {isActive && (
              <motion.span
                layoutId="nav-dot"
                className="rounded-full"
                style={{ height: 3, width: 18, background: '#ffffff' }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
