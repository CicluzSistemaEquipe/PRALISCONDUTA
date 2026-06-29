import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { GraduationCap, UserRound, Megaphone } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useSession } from '../context/SessionContext'
import { useSocialVersion, unreadCountForEmployee } from '@/lib/social'

// 'progress' e 'lis' permanecem no tipo por compatibilidade com rotas existentes
export type Tab = 'feed' | 'social' | 'progress' | 'lis' | 'profile'

export const TAB_PATH: Record<Tab, string> = {
  feed:     '/feed',
  social:   '/social',
  progress: '/progresso',
  lis:      '/perfil',   // redireciona para perfil
  profile:  '/perfil',
}

const NAV_ITEMS: { id: Tab; icon: typeof GraduationCap; label: string }[] = [
  { id: 'feed',    icon: GraduationCap, label: 'Treinamento' },
  { id: 'social',  icon: Megaphone,     label: 'Social' },
  { id: 'profile', icon: UserRound,     label: 'Perfil' },
]

/**
 * Rodapé com cor própria (marrom da marca) para se destacar do corpo quase-preto.
 * Ícones com destaque forte: ativo = pílula laranja preenchida com ícone branco;
 * inativo = bege da marca. Sem padrão de fundo nem loop infinito.
 * A aba Social exibe um badge quando há comunicados não lidos.
 */
export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { theme } = useTheme()
  const { employee } = useSession()
  const version = useSocialVersion()
  const reduce = useReducedMotion()
  const isLight = theme === 'light'
  const idle = isLight ? '#8a7a6b' : '#e8cfa0'

  const socialUnread = useMemo(
    () => (employee ? unreadCountForEmployee(employee) : 0),
    [employee, version],
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-stretch justify-around"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #fff7ef 0%, #fdeede 100%)'
          : 'linear-gradient(180deg, #45221b 0%, #331812 100%)',
        borderTop: `1.5px solid ${isLight ? 'rgba(243,116,53,0.30)' : 'rgba(243,116,53,0.40)'}`,
        boxShadow: isLight ? '0 -10px 30px rgba(94,55,49,0.12)' : '0 -14px 34px rgba(0,0,0,0.45)',
        padding: '9px 22px calc(var(--safe-bottom) + 9px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id
        const I = item.icon
        const badge = item.id === 'social' ? socialUnread : 0

        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.9 }}
            aria-label={badge > 0 ? `${item.label} (${badge} novo${badge > 1 ? 's' : ''})` : item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex min-w-[72px] flex-col items-center justify-center gap-1 pt-0.5"
            style={{ transition: 'color 0.2s ease' }}
          >
            <span className="relative flex h-10 w-12 items-center justify-center rounded-[14px]">
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-[14px]"
                  style={{ background: '#f37435', boxShadow: '0 8px 20px -6px rgba(243,116,53,0.6)' }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                />
              )}
              <motion.span
                className="relative"
                variants={{ off: { scale: 1 }, on: reduce ? { scale: 1 } : { scale: [1, 1.18, 1] } }}
                animate={isActive && item.id === 'feed' ? 'on' : 'off'}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <I size={21} strokeWidth={isActive ? 2.6 : 2.1} color={isActive ? '#ffffff' : idle} />
              </motion.span>
              {badge > 0 && (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    top: -2, right: 2, minWidth: 16, height: 16, padding: '0 4px',
                    borderRadius: 999, background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 800, lineHeight: '16px', textAlign: 'center',
                    border: '1.5px solid #331812',
                  }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
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
