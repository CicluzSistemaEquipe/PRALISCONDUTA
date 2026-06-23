import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock, FileSignature, FileText, Settings2, Users } from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '../data'

export default function Overview() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    loadEmployeeRows().then(setRows)
  }, [])

  if (!rows) return <Skeleton />

  const total = rows.length
  const signed = rows.filter((row) => row.signed).length
  const completed = rows.filter((row) => row.progress >= 1).length
  const pending = total - completed
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <h1 className="font-display text-3xl text-pralis-branco">Visao geral</h1>
      <p className="mt-1 font-body text-sm text-pralis-creme/60">
        Acompanhe o progresso da sua equipe no Codigo de Conduta.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card icon={Users} label="Cadastrados" value={total} color="#b8860b" />
        <Card icon={CheckCircle2} label="Concluiram" value={`${completed} (${pct}%)`} color="#5dd87a" />
        <Card icon={Clock} label="Pendentes" value={pending} color="#f37435" />
        <Card icon={FileSignature} label="Assinaram" value={signed} color="#d4a86a" />
      </div>

      <h2 className="mt-8 font-display text-xl text-pralis-branco">Gestao do aplicativo</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Shortcut to="/admin/inicio" icon={BookOpen} title="Inicio da Pralis" text="Editar tour, missao, visao e valores." />
        <Shortcut to="/admin/modulos" icon={Settings2} title="Modulos" text="Editar textos, videos, quizzes e ordem." />
        <Shortcut to="/admin/termos" icon={FileText} title="Termos finais" text="Editar documentos antes da assinatura." />
      </div>

      <h2 className="mt-8 font-display text-xl text-pralis-branco">Ultimos cadastrados</h2>
      <div className="mt-3 flex flex-col gap-2">
        {rows.slice(0, 6).map((row) => (
          <div
            key={row.employee.id}
            className="flex items-center justify-between rounded-xl border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 px-4 py-3"
          >
            <div>
              <p className="font-body font-semibold text-pralis-branco">{row.employee.name}</p>
              <p className="font-body text-xs text-pralis-creme/60">{row.employee.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-pralis-laranja"
                  style={{ width: `${Math.round(row.progress * 100)}%` }}
                />
              </div>
              <span className="w-10 text-right font-body text-xs text-pralis-creme/70">
                {Math.round(row.progress * 100)}%
              </span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-pralis-marrom-lk/50 px-4 py-8 text-center font-body text-sm text-pralis-creme/50">
            Nenhum colaborador cadastrado ainda. Va em Adicionar para gerar o primeiro link.
          </p>
        )}
      </div>
    </div>
  )
}

function Card({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-card border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 p-5">
      <span
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}22` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </span>
      <p className="font-display text-2xl text-pralis-branco">{value}</p>
      <p className="font-body text-xs text-pralis-creme/60">{label}</p>
    </div>
  )
}

function Shortcut({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string
  icon: typeof Users
  title: string
  text: string
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 p-4 transition-colors hover:border-pralis-laranja/50 hover:bg-pralis-marrom-dk/70"
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pralis-laranja/15 text-pralis-laranja">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-body text-sm font-black text-pralis-branco">{title}</p>
      <p className="mt-1 font-body text-xs leading-relaxed text-pralis-creme/60">{text}</p>
    </Link>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skeleton h-28" />
      ))}
    </div>
  )
}
