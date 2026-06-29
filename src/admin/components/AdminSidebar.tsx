import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldCheck,
  ScrollText,
  BarChart3,
  Megaphone,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { brand } from '@/lib/brand'
import { PralisSymbol } from '@/app/components/PralisSymbol'
import { adminLogout, getAdminSession } from '../auth'
import { AdminProfileButton } from './AdminProfileButton'
import { useInboxVersion, unreadInboxCount, unreadForGerente } from '@/lib/inbox'
import { enableAdminPreview } from '@/lib/devMode'

type NavEntry = { to: string; label: string; icon: typeof LayoutDashboard }
type NavGroup = { label?: string; items: NavEntry[] }

// Navegação agrupada por área — organização de plataforma (Pessoas / Conteúdo / Análise).
const NAV_DONO: NavGroup[] = [
  { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Pessoas',
    items: [
      { to: '/admin/colaboradores', label: 'Colaboradores', icon: Users },
      { to: '/admin/gerentes', label: 'Gerentes', icon: ShieldCheck },
    ],
  },
  {
    label: 'Conteúdo',
    items: [
      { to: '/admin/modulos', label: 'Módulos', icon: BookOpen },
      { to: '/admin/termos', label: 'Termos', icon: ScrollText },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { to: '/admin/social', label: 'Social', icon: Megaphone },
      { to: '/admin/mensagens', label: 'Mensagens', icon: Inbox },
    ],
  },
  { label: 'Análise', items: [{ to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 }] },
]

const NAV_GERENTE: NavGroup[] = [
  { items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Pessoas', items: [{ to: '/admin/colaboradores', label: 'Minha equipe', icon: Users }] },
  {
    label: 'Comunicação',
    items: [
      { to: '/admin/social', label: 'Social', icon: Megaphone },
      { to: '/admin/mensagens', label: 'Mensagens', icon: Inbox },
    ],
  },
  { label: 'Análise', items: [{ to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 }] },
]

function Brand() {
  return (
    <motion.div
      className="flex cursor-default items-center gap-3"
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      <motion.div
        initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        whileHover={{ rotate: -10 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.05 }}
      >
        <PralisSymbol size={42} colorA="#5e3731" colorB="#f37435" animate={false} />
      </motion.div>
      <motion.img
        src={brand.logoSVGPreta}
        alt="Pralís"
        className="h-[30px] w-auto"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}

function NavItems({ groups, onNavigate, badges }: { groups: NavGroup[]; onNavigate?: () => void; badges?: Record<string, number> }) {
  return (
    <nav className="flex flex-1 flex-col gap-3">
      {groups.map((group, gi) => (
        <div key={group.label ?? `g${gi}`} className="flex flex-col gap-0.5">
          {group.label && (
            <p className="px-3 pb-1 pt-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {group.label}
            </p>
          )}
          {group.items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[0.875rem] transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-tint)] font-semibold text-[var(--accent-text)]'
                    : 'font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="adm-nav-active"
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)]"
                    />
                  )}
                  <n.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.9} />
                  {n.label}
                  {badges && badges[n.to] > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[0.65rem] font-bold text-white">
                      {badges[n.to] > 9 ? '9+' : badges[n.to]}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const session = getAdminSession()
  const isDono = session?.role === 'dono'
  const items = isDono ? NAV_DONO : NAV_GERENTE
  const roleLabel = isDono ? 'Dono' : 'Gerente'

  const inboxV = useInboxVersion()
  const badges = useMemo<Record<string, number>>(
    () => ({ '/admin/mensagens': isDono ? unreadInboxCount() : (session ? unreadForGerente(session.id) : 0) }),
    [inboxV, isDono, session],
  )

  const logout = () => {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-6 px-1">
        <Brand />
      </div>

      <NavItems groups={items} onNavigate={onNavigate} badges={badges} />

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border)] pt-3">
        {session && <AdminProfileButton session={session} roleLabel={roleLabel} />}

        <a
          href="/feed"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => enableAdminPreview()}
          title="Abre o app com todo o treinamento liberado (apenas para Dono/Gerente)"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[0.875rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]"
        >
          <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.9} /> Ver o app
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[0.875rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* sidebar fixa (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-[var(--border)] bg-white md:block">
        <SidebarBody />
      </aside>

      {/* topbar (mobile) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-[var(--border-strong)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* drawer (mobile) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-[rgba(26,23,20,0.35)] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-[264px] border-r border-[var(--border)] bg-white md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-4 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)]"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
