import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FileBarChart, FilePenLine, LayoutDashboard, LogOut, UserPlus, Users } from 'lucide-react'
import { isDashAuthed, dashLogout } from '../auth'
import { brand } from '@/lib/brand'

const NAV = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/colaboradores', label: 'Colaboradores', icon: Users, end: false },
  { to: '/dashboard/novo', label: 'Adicionar', icon: UserPlus, end: false },
  { to: '/dashboard/relatorios', label: 'Relatórios', icon: FileBarChart, end: false },
  { to: '/admin/dashboard', label: 'Editar app', icon: FilePenLine, end: false },
]

export default function DashLayout() {
  const navigate = useNavigate()
  if (!isDashAuthed()) return <Navigate to="/dashboard/login" replace />

  const handleLogout = async () => {
    await dashLogout()
    navigate('/dashboard/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-pralis-marrom text-pralis-creme">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-pralis-marrom-lk/50 bg-pralis-marrom-dk/60 p-5 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <img src={brand.logoBege} alt="Padaria Pralís" className="h-8 w-auto" />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-pralis-laranja/15 text-pralis-laranja'
                    : 'text-pralis-creme/70 hover:bg-white/5'
                }`
              }
            >
              <n.icon className="h-5 w-5" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-semibold text-pralis-creme/70 transition-colors hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </aside>

      {/* mobile topbar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-pralis-marrom-lk/50 bg-pralis-marrom-dk/60 px-5 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <img src={brand.logoBege} alt="Padaria Pralís" className="h-7 w-auto" />
          </div>
          <button onClick={handleLogout} aria-label="Sair">
            <LogOut className="h-5 w-5 text-pralis-creme/70" />
          </button>
        </header>

        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-pralis-marrom-lk/50 px-3 py-2 md:hidden">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-pill px-3 py-1.5 font-body text-xs font-semibold ${
                  isActive ? 'bg-pralis-laranja/15 text-pralis-laranja' : 'text-pralis-creme/60'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
