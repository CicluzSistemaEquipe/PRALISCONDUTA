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
import { brand, FILTER_WHITE } from '@/lib/brand'
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

function NavItems({ items, onNavigate }: { items: NavEntry[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-[rgba(184,134,11,0.16)] text-[var(--gold-light)] ring-1 ring-[rgba(184,134,11,0.3)]'
                : 'text-[var(--cream-muted)] hover:bg-white/5 hover:text-[var(--cream)]'
            }`
          }
        >
          <n.icon className="h-[18px] w-[18px]" />
          {n.label}
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
    <div className="flex h-full flex-col p-5">
      <div className="mb-7 flex items-center gap-2.5">
        <img src={brand.logoSVGBranca} alt="Padaria Pralís" className="h-8 w-auto" style={{ filter: FILTER_WHITE }} />
        <span className="rounded-md bg-[rgba(184,134,11,0.16)] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[var(--gold-light)]">
          Admin
        </span>
      </div>

      <NavItems items={items} onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-2 border-t border-[rgba(184,134,11,0.18)] pt-3">
        {/* usuário logado */}
        {session && (
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[0.8rem] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#b8860b,#7a5a07)', fontFamily: 'Playfair Display, serif' }}
            >
              {initials(session.nome)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8rem] font-bold text-[var(--cream)]">{session.nome}</p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--gold-light)]">{roleLabel}</p>
            </div>
          </div>
        )}

        <a
          href="/feed"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--cream-muted)] transition-colors hover:bg-white/5 hover:text-[var(--cream)]"
        >
          <ExternalLink className="h-[18px] w-[18px]" /> Ver o app
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--cream-muted)] transition-colors hover:bg-[rgba(192,57,43,0.12)] hover:text-[#e2604f]"
        >
          <LogOut className="h-[18px] w-[18px]" /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* sidebar fixa (desktop) */}
      <aside
        className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-[rgba(184,134,11,0.18)] md:block"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <SidebarBody />
      </aside>

      {/* topbar (mobile) */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b border-[rgba(184,134,11,0.18)] px-4 py-3 md:hidden"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <img src={brand.logoSVGBranca} alt="Padaria Pralís" className="h-7 w-auto" style={{ filter: FILTER_WHITE }} />
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-[rgba(184,134,11,0.25)] p-2 text-[var(--cream)]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* drawer (mobile) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-[260px] border-r border-[rgba(184,134,11,0.2)] md:hidden"
              style={{ background: 'rgba(13,8,0,0.96)', backdropFilter: 'blur(20px)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="absolute right-3 top-3 rounded-lg p-2 text-[var(--cream-muted)]"
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
