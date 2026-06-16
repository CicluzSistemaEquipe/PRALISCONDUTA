import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { ROLES, type Role } from '@/lib/types'
import { Loading } from '../components/Loading'

/**
 * Login automático do colaborador a partir do link gerado no admin:
 *   /acesso?mat=MATRICULA&nome=NOME&cargo=CARGO
 * A matrícula funciona como token de sessão (resume/cria o colaborador).
 */
export default function Acesso() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useSession()
  const [error, setError] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const mat = params.get('mat') || params.get('t') || ''
    const nome = params.get('nome') || ''
    const cargoRaw = params.get('cargo') || ''
    const cargo = (ROLES as string[]).includes(cargoRaw) ? (cargoRaw as Role) : null

    if (!mat || !nome || !cargo) {
      setError(true)
      return
    }
    login({ name: nome, phone: mat, role: cargo, token: mat })
      .then(() => navigate('/feed', { replace: true }))
      .catch(() => setError(true))
  }, [params, login, navigate])

  if (error) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl">🌾</span>
          <h1 className="font-display text-2xl text-pralis-branco">Link inválido</h1>
          <p className="font-body text-sm text-pralis-creme/70">
            Este link de acesso está incompleto. Peça um novo ao seu gestor.
          </p>
          <Link to="/login" className="btn-ghost mt-2">Entrar manualmente</Link>
        </div>
      </div>
    )
  }

  return <Loading />
}
