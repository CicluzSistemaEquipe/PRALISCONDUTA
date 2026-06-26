import { Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazyWithRetry } from './lib/lazyWithRetry'
import { ErrorBoundary } from './app/components/ErrorBoundary'
import { motion } from 'framer-motion'
import { SessionProvider, useSession } from './app/context/SessionContext'
import { Loading } from './app/components/Loading'
import { DevToolbar } from './app/components/DevToolbar'
import { isDevMode } from './lib/devMode'
import { hasRequiredOnboarding } from './lib/onboarding'
import { AdminGuard } from './admin/components/AdminGuard'

// code splitting por rota
const Splash = lazyWithRetry(() => import('./app/pages/Splash'))
const Onboarding = lazyWithRetry(() => import('./app/pages/Onboarding'))
const Login = lazyWithRetry(() => import('./app/pages/Login'))
const Acesso = lazyWithRetry(() => import('./app/pages/Acesso'))
const Feed = lazyWithRetry(() => import('./app/pages/Feed'))
const ProgressScreen = lazyWithRetry(() => import('./app/pages/Progress'))
const Profile = lazyWithRetry(() => import('./app/pages/Profile'))
const ModulePage = lazyWithRetry(() => import('./app/pages/Module'))
const Completion = lazyWithRetry(() => import('./app/pages/Completion'))

// Admin CMS (Dono + Gerente)
const AdminLogin = lazyWithRetry(() => import('./admin/pages/AdminLogin'))
const AdminLayout = lazyWithRetry(() => import('./admin/layout/AdminLayout'))
const AdminDashboard = lazyWithRetry(() => import('./admin/pages/AdminDashboard'))
const AdminModulos = lazyWithRetry(() => import('./admin/pages/AdminModulos'))
const AdminModuloEditor = lazyWithRetry(() => import('./admin/pages/AdminModuloEditor'))
const AdminInicio = lazyWithRetry(() => import('./admin/pages/AdminInicio'))
const AdminColaboradores = lazyWithRetry(() => import('./admin/pages/AdminColaboradores'))
const AdminGerentes = lazyWithRetry(() => import('./admin/pages/AdminGerentes'))
const AdminTermos = lazyWithRetry(() => import('./admin/pages/AdminTermos'))
const AdminAcompanhamento = lazyWithRetry(() => import('./admin/pages/AdminAcompanhamento'))

function RequireAuth({ children }: { children: ReactNode }) {
  const { employee, loading } = useSession()
  const location = useLocation()
  if (loading) return <Loading />
  if (!employee) return <Navigate to="/login" replace />
  if (!isDevMode() && !hasRequiredOnboarding(employee.id)) {
    return <Navigate to="/conheca?entry=1" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      >
        <ErrorBoundary>
          <Routes location={location}>
            {/* App do colaborador */}
            <Route path="/" element={<Splash />} />
            <Route path="/conheca" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/acesso" element={<Acesso />} />
            <Route
              path="/feed"
              element={
                <RequireAuth>
                  <Feed />
                </RequireAuth>
              }
            />
            <Route
              path="/progresso"
              element={
                <RequireAuth>
                  <ProgressScreen />
                </RequireAuth>
              }
            />
            <Route path="/lis" element={<Navigate to="/perfil" replace />} />
            <Route
              path="/perfil"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/modulo/:id"
              element={
                <RequireAuth>
                  <ModulePage />
                </RequireAuth>
              }
            />
            <Route
              path="/conclusao"
              element={
                <RequireAuth>
                  <Completion />
                </RequireAuth>
              }
            />
            {/* Admin — Dono + Gerente */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="colaboradores" element={<AdminColaboradores />} />
              <Route path="colaboradores/novo" element={<AdminColaboradores />} />
              <Route path="relatorios" element={<AdminAcompanhamento />} />
              {/* Somente Dono */}
              <Route path="gerentes" element={<AdminGuard requireDono><AdminGerentes /></AdminGuard>} />
              <Route path="modulos" element={<AdminGuard requireDono><AdminModulos /></AdminGuard>} />
              <Route path="modulos/:id" element={<AdminGuard requireDono><AdminModuloEditor /></AdminGuard>} />
              <Route path="termos" element={<AdminGuard requireDono><AdminTermos /></AdminGuard>} />
              <Route path="inicio" element={<AdminGuard requireDono><AdminInicio /></AdminGuard>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </motion.div>
    </Suspense>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <AnimatedRoutes />
        {isDevMode() && <DevToolbar />}
      </BrowserRouter>
    </SessionProvider>
  )
}
