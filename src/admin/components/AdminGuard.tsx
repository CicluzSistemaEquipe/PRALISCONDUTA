import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdminAuthed, isDono } from '../auth'

interface AdminGuardProps {
  children: ReactNode
  /** quando true, apenas usuários com role 'dono' acessam */
  requireDono?: boolean
}

/** Protege as rotas /admin/*. Sem sessão → login. Sem permissão de Dono → dashboard. */
export function AdminGuard({ children, requireDono = false }: AdminGuardProps) {
  const location = useLocation()
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  if (requireDono && !isDono()) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <>{children}</>
}
