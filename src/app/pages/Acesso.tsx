import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { type Role } from '@/lib/types'
import { getEmployeeById } from '@/lib/storage'
import { registrarEvento } from '@/lib/tracking'
import { hasRequiredOnboarding } from '@/lib/onboarding'
import { Loading } from '../components/Loading'

/**
 * Login automático do colaborador a partir do link gerado no admin.
 * Formatos aceitos:
 *   /acesso?id=EMPLOYEE_ID                      (link personalizado atual)
 *   /acesso?mat=MATRICULA&nome=NOME&cargo=CARGO (formato legado)
 */
export default function Acesso() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login, resumeByToken } = useSession()
  const [error, setError] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const goIn = (id: string) => {
      void registrarEvento({ tipo: 'login', colaboradorId: id })
      navigate(hasRequiredOnboarding(id) ? '/feed' : '/conheca?entry=1', { replace: true })
    }

    // 1) link personalizado por id
    const id = params.get('id')
    if (id) {
      getEmployeeById(id)
        .then((emp) => {
          if (!emp) { setError(true); return }
          return resumeByToken(emp.token).then((r) => {
            if (!r) { setError(true); return }
            goIn(emp.id)
          })
        })
        .catch(() => setError(true))
      return
    }

    // 2) formato legado: mat + nome + cargo
    const mat = params.get('mat') || params.get('t') || ''
    const nome = params.get('nome') || ''
    const cargoRaw = params.get('cargo') || ''
    // Cargo agora é texto livre (cargos cadastráveis) — aceita qualquer cargo
    // não vazio vindo do link. Os 10 cargos semente seguem válidos.
    const cargo: Role | null = cargoRaw.trim() || null

    if (!mat || !nome || !cargo) {
      setError(true)
      return
    }
    login({ name: nome, phone: mat, role: cargo, token: mat })
      .then((emp) => goIn(emp?.id ?? mat))
      .catch(() => setError(true))
  }, [params, login, resumeByToken, navigate])

  if (error) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl">🌾</span>
          <h1 className="font-display text-2xl text-pralis-branco">Link inválido</h1>
          <p className="font-body text-sm text-pralis-creme/70">
            Este link de acesso está incompleto ou expirou. Peça um novo ao seu gestor.
          </p>
        </div>
      </div>
    )
  }

  return <Loading />
}
