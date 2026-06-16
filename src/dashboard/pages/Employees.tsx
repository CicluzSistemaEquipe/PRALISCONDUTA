import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '../data'

export default function Employees() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    loadEmployeeRows().then(setRows)
  }, [])

  const copy = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(id)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      /* ignore */
    }
  }

  if (!rows) return <div className="skeleton h-64" />

  return (
    <div>
      <h1 className="font-display text-3xl text-pralis-branco">Colaboradores</h1>
      <p className="mt-1 font-body text-sm text-pralis-creme/60">
        {rows.length} cadastrado{rows.length === 1 ? '' : 's'}.
      </p>

      <div className="mt-6 overflow-x-auto rounded-card border border-pralis-marrom-lk/50">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-pralis-marrom-dk/60 text-left font-body text-xs uppercase tracking-wide text-pralis-creme/60">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Progresso</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Conclusão</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody className="font-body text-sm">
            {rows.map((r) => (
              <tr key={r.employee.id} className="border-t border-pralis-marrom-lk/30">
                <td className="px-4 py-3 font-semibold text-pralis-branco">{r.employee.name}</td>
                <td className="px-4 py-3 text-pralis-creme/80">{r.employee.role}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-pralis-laranja"
                        style={{ width: `${Math.round(r.progress * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-pralis-creme/70">{Math.round(r.progress * 100)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {r.signed ? (
                    <span className="rounded-pill bg-pralis-verde/15 px-2.5 py-1 text-xs font-semibold text-pralis-verde">
                      Assinado
                    </span>
                  ) : r.progress >= 1 ? (
                    <span className="rounded-pill bg-pralis-ouro/15 px-2.5 py-1 text-xs font-semibold text-pralis-ouro-lt">
                      Concluído
                    </span>
                  ) : (
                    <span className="rounded-pill bg-pralis-laranja/15 px-2.5 py-1 text-xs font-semibold text-pralis-laranja">
                      Em andamento
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-pralis-creme/70">
                  {r.signedAt ? new Date(r.signedAt).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copy(r.link, r.employee.id)}
                      className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-pralis-creme/80 hover:bg-white/10"
                    >
                      {copied === r.employee.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-pralis-verde" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copiar
                        </>
                      )}
                    </button>
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pralis-creme/50 hover:text-pralis-laranja"
                      aria-label="Abrir link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-pralis-creme/50">
                  Nenhum colaborador cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
