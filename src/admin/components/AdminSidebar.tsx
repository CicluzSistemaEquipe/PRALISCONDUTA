import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShieldCheck,
  ScrollText,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { brand } from '@/lib/brand'
import { PralisSymbol } from '@/app/components/PralisSymbol'
import { adminLogout, getAdminSession } from '../auth'

type NavEntry = { to: string; label: string; icon: typeof LayoutDashboard }

const NAV_DONO: NavEntry[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/colaboradores', label: 'Colaboradores', icon: Users },
  { to: '/admin/gerentes', label: 'Gerentes', icon: ShieldCheck },
  { to: '/admin/modulos', label: 'Módulos', icon: BookOpen },
  { to: '/admin/termos', label: 'Termos', icon: ScrollText },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

const NAV_GERENTE: NavEntry[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/colaboradores', label: 'Minha equipe', icon: Users },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <PralisSymbol size={26} colorA="#5e3731" colorB="#f37435" animate={false} />
      <div className="flex items-baseline gap-1.5">
        <img src={brand.logoSVGPreta} alt="Pralís" className="h-[18px] w-auto" />
        <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Admin
        </span>
      </div>
    </div>
  )
}

function NavItems({ items, onNavigate }: { items: NavEntry[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5">
      {items.map((n) => (
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
            </>
          )}
        </NavLink>
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

  const logout = () => {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  const SidebarBody = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-6 px-1">
        <Brand />
      </div>

      <NavItems items={items} onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border)] pt-3">
        {session && (
          <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-brown)] text-[0.78rem] font-bold text-white">
              {initials(session.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8rem] font-semibold text-[var(--ink)]">{session.nome}</p>
              <p className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--text-muted)]">
                {roleLabel}
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Online
              </p>
            </div>
          </div>
        )}

        <a
          href="/feed"
          target="_blank"
          rel="noopener noreferrer"
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
