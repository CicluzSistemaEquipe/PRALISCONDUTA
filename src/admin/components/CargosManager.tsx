import { useState, type FormEvent } from 'react'
import { Briefcase, Plus, Trash2, Check } from 'lucide-react'
import { ModalShell, ModalHeader, ModalFooter, EmptyState } from './ui'
import { useCargos, addCargo, updateCargo, setCargoAtivo, removeCargo, isSeedCargo } from '@/lib/cargos'

// Acentos da paleta Pralís para identidade visual do cargo.
const PALETTE = ['#f37435', '#b8860b', '#5e3731', '#5dd87a', '#2980b9', '#8e44ad', '#c0392b', '#27ae60']

/** Gerenciador de Cargos (mesmo espírito do LojasManager). Os formulários de
 *  colaborador/gerente puxam essa lista. Renomear fica para depois (evita
 *  orfanar cadastros antigos); aqui: adicionar, cor, ativar/desativar, remover. */
export function CargosManager({ onClose }: { onClose: () => void }) {
  const cargos = useCargos()
  const [nome, setNome] = useState('')
  const [accent, setAccent] = useState(PALETTE[0])

  const add = (e: FormEvent) => {
    e.preventDefault()
    const v = nome.trim()
    if (!v) return
    addCargo({ nome: v, accent })
    setNome('')
  }

  return (
    <ModalShell
      onClose={onClose}
      size="md"
      header={<ModalHeader icon={Briefcase} eyebrow="Pessoas" title="Cargos" onClose={onClose} tone="brown" />}
      footer={<ModalFooter><button type="button" onClick={onClose} className="adm-btn flex-1">Fechar</button></ModalFooter>}
    >
      <p className="mb-3 text-[0.8rem] text-[var(--text-muted)]">
        Cadastre os cargos uma vez. Eles aparecem no cadastro de colaboradores e gerentes e definem o Treinamento que cada um recebe.
      </p>

      {/* adicionar */}
      <form onSubmit={add} className="mb-4 flex flex-col gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3.5">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="adm-label" htmlFor="cg-nome">Novo cargo</label>
            <input id="cg-nome" className="adm-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Confeiteiro Sênior" />
          </div>
          <button type="submit" disabled={!nome.trim()} className="adm-btn adm-btn--primary h-9 shrink-0 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[0.72rem] text-[var(--text-muted)]">Cor:</span>
          {PALETTE.map((c) => (
            <button key={c} type="button" aria-label={`Cor ${c}`} onClick={() => setAccent(c)}
              className={`h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 ${accent === c ? 'border-[var(--ink)]' : 'border-[var(--border)]'}`}
              style={{ background: c }} />
          ))}
        </div>
      </form>

      {/* lista */}
      {cargos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)]">
          <EmptyState icon={Briefcase} title="Nenhum cargo" hint="Adicione o primeiro cargo acima." compact />
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {cargos.map((c) => {
            const ativo = c.ativo !== false
            const seed = isSeedCargo(c.id)
            return (
              <li key={c.id} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: c.accent ?? 'var(--brand-brown)' }} />
                  <span className={`min-w-0 flex-1 truncate text-[0.85rem] font-medium ${ativo ? 'text-[var(--ink)]' : 'text-[var(--text-muted)] line-through'}`}>
                    {c.nome}
                  </span>
                  {seed && <span className="adm-badge adm-badge--muted shrink-0">Padrão</span>}
                  {/* ativar/desativar */}
                  <button type="button" role="switch" aria-checked={ativo} aria-label={`${c.nome} ativo`}
                    onClick={() => setCargoAtivo(c.id, !ativo)}
                    className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
                    style={{ background: ativo ? 'var(--accent)' : 'var(--border-strong)' }}>
                    <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: ativo ? 18 : 2 }} />
                  </button>
                  {!seed && (
                    <button type="button" onClick={() => removeCargo(c.id)} aria-label={`Remover ${c.nome}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]">
                      <Trash2 className="h-[15px] w-[15px]" />
                    </button>
                  )}
                </div>
                {/* cor rápida */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-6">
                  {PALETTE.map((col) => (
                    <button key={col} type="button" aria-label={`Cor ${col} para ${c.nome}`} onClick={() => updateCargo(c.id, { accent: col })}
                      className={`h-5 w-5 rounded-md border-2 transition-transform hover:scale-110 ${(c.accent ?? '') === col ? 'border-[var(--ink)]' : 'border-[var(--border)]'}`}
                      style={{ background: col }}>
                      {(c.accent ?? '') === col && <Check className="mx-auto h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }} />}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </ModalShell>
  )
}
