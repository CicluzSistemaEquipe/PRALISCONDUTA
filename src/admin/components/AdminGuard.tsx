import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdminAuthed } from '../auth'

/** Protege as rotas /admin/*. Sem sessão → redireciona para o login. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
