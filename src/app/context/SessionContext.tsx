import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Employee, ModuleProgress, Role } from '@/lib/types'
import {
  createEmployee,
  getEmployeeById,
  getEmployeeByToken,
  getProgress,
  saveProgress as persistProgress,
} from '@/lib/storage'

const CURRENT_KEY = 'pralis:current-employee'

interface SessionValue {
  employee: Employee | null
  loading: boolean
  progress: Record<string, ModuleProgress>
  /** registra/recupera o colaborador a partir do formulário de cadastro */
  login: (input: { name: string; phone: string; role: Role; token?: string }) => Promise<Employee>
  /** tenta recuperar uma sessão por token de link (?t=...) */
  resumeByToken: (token: string) => Promise<Employee | null>
  logout: () => void
  setStoryIndex: (moduleId: string, index: number) => void
  completeModule: (moduleId: string) => void
  isCompleted: (moduleId: string) => boolean
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({})

  const loadProgress = useCallback(async (id: string) => {
    const list = await getProgress(id)
    const map: Record<string, ModuleProgress> = {}
    for (const p of list) map[p.module_id] = p
    setProgress(map)
  }, [])

  // restaura sessão ao abrir o app
  useEffect(() => {
    let active = true
    ;(async () => {
      const id = localStorage.getItem(CURRENT_KEY)
      if (id) {
        const emp = await getEmployeeById(id)
        if (active && emp) {
          setEmployee(emp)
          await loadProgress(emp.id)
        }
      }
      if (active) setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [loadProgress])

  const login = useCallback<SessionValue['login']>(
    async (input) => {
      // se já existe colaborador com o token, reaproveita
      let emp: Employee | null = input.token ? await getEmployeeByToken(input.token) : null
      if (!emp) emp = await createEmployee(input)
      localStorage.setItem(CURRENT_KEY, emp.id)
      setEmployee(emp)
      await loadProgress(emp.id)
      return emp
    },
    [loadProgress],
  )

  const resumeByToken = useCallback<SessionValue['resumeByToken']>(
    async (token) => {
      const emp = await getEmployeeByToken(token)
      if (emp) {
        localStorage.setItem(CURRENT_KEY, emp.id)
        setEmployee(emp)
        await loadProgress(emp.id)
      }
      return emp
    },
    [loadProgress],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_KEY)
    setEmployee(null)
    setProgress({})
  }, [])

  const upsert = useCallback(
    (moduleId: string, patch: Partial<ModuleProgress>) => {
      if (!employee) return
      setProgress((prev) => {
        const current: ModuleProgress = prev[moduleId] ?? {
          module_id: moduleId,
          story_index: 0,
          completed: false,
          completed_at: null,
        }
        const next: ModuleProgress = { ...current, ...patch }
        void persistProgress(employee.id, next)
        return { ...prev, [moduleId]: next }
      })
    },
    [employee],
  )

  const setStoryIndex = useCallback(
    (moduleId: string, index: number) => {
      setProgress((prev) => {
        const current = prev[moduleId]
        // não retrocede o índice salvo
        if (current && current.story_index >= index) return prev
        upsert(moduleId, { story_index: index })
        return prev
      })
    },
    [upsert],
  )

  const completeModule = useCallback(
    (moduleId: string) => {
      upsert(moduleId, { completed: true, completed_at: new Date().toISOString() })
    },
    [upsert],
  )

  const isCompleted = useCallback(
    (moduleId: string) => Boolean(progress[moduleId]?.completed),
    [progress],
  )

  const value = useMemo<SessionValue>(
    () => ({
      employee,
      loading,
      progress,
      login,
      resumeByToken,
      logout,
      setStoryIndex,
      completeModule,
      isCompleted,
    }),
    [employee, loading, progress, login, resumeByToken, logout, setStoryIndex, completeModule, isCompleted],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>')
  return ctx
}
