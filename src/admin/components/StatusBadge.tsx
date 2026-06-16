export type EmpStatus = 'pendente' | 'andamento' | 'concluido' | 'assinou'

export function statusOf(r: { progress: number; signed: boolean }): EmpStatus {
  if (r.signed) return 'assinou'
  if (r.progress >= 1) return 'concluido'
  if (r.progress > 0) return 'andamento'
  return 'pendente'
}

const META: Record<EmpStatus, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'adm-badge--muted' },
  andamento: { label: 'Em andamento', cls: 'adm-badge--gold' },
  concluido: { label: 'Concluído', cls: 'adm-badge--green' },
  assinou: { label: 'Assinou', cls: 'adm-badge--green-dk' },
}

export function StatusBadge({ status }: { status: EmpStatus }) {
  const m = META[status]
  return <span className={`adm-badge ${m.cls}`}>{m.label}</span>
}
