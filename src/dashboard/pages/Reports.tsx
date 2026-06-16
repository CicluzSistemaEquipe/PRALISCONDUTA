import { useEffect, useState } from 'react'
import { Download, FileBarChart } from 'lucide-react'
import { loadEmployeeRows, type EmployeeRow } from '../data'

function toCSV(rows: EmployeeRow[]): string {
  const header = [
    'Nome',
    'Cargo',
    'WhatsApp',
    'Modulos concluidos',
    'Total modulos',
    'Progresso (%)',
    'Quiz corretos',
    'Quiz total',
    'Assinou',
    'Data assinatura',
    'Link',
  ]
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [
      r.employee.name,
      r.employee.role,
      r.employee.phone,
      String(r.completedModules),
      String(r.totalModules),
      String(Math.round(r.progress * 100)),
      String(r.quizCorrect),
      String(r.quizTotal),
      r.signed ? 'Sim' : 'Nao',
      r.signedAt ? new Date(r.signedAt).toLocaleString('pt-BR') : '',
      r.link,
    ]
      .map(escape)
      .join(','),
  )
  return [header.map(escape).join(','), ...lines].join('\n')
}

export default function Reports() {
  const [rows, setRows] = useState<EmployeeRow[] | null>(null)

  useEffect(() => {
    loadEmployeeRows().then(setRows)
  }, [])

  const download = () => {
    if (!rows) return
    const csv = '﻿' + toCSV(rows) // BOM para acentos no Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pralis-conduta-relatorio.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-pralis-branco">Relatórios</h1>
      <p className="mt-1 font-body text-sm text-pralis-creme/60">
        Exporte os dados de progresso e assinaturas da equipe.
      </p>

      <div className="mt-6 flex flex-col items-start gap-4 rounded-card border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pralis-ouro/15">
          <FileBarChart className="h-6 w-6 text-pralis-ouro-lt" />
        </span>
        <div>
          <h2 className="font-display text-xl text-pralis-branco">Relatório completo (CSV)</h2>
          <p className="font-body text-sm text-pralis-creme/70">
            Inclui cargo, progresso por colaborador, acertos no quiz, status de assinatura e o link de acesso.
            {rows ? ` ${rows.length} registro(s).` : ' Carregando…'}
          </p>
        </div>
        <button onClick={download} disabled={!rows || rows.length === 0} className="btn-laranja">
          <Download className="h-5 w-5" /> Baixar CSV
        </button>
      </div>
    </div>
  )
}
