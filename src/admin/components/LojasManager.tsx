import { useState, type FormEvent } from 'react'
import { Store, Plus, Trash2 } from 'lucide-react'
import { ModalShell, ModalHeader, ModalFooter, EmptyState } from './ui'
import { useLojas, addLoja, removeLoja } from '@/lib/lojas'

/** Modal para cadastrar/remover lojas de uma vez. Os formularios puxam essa lista. */
export function LojasManager({ onClose }: { onClose: () => void }) {
  const lojas = useLojas()
  const [nome, setNome] = useState('')

  const add = (e: FormEvent) => {
    e.preventDefault()
    const v = nome.trim()
    if (!v) return
    addLoja(v)
    setNome('')
  }

  return (
    <ModalShell
      onClose={onClose}
      size="sm"
      header={<ModalHeader icon={Store} eyebrow="Equipe" title="Lojas / Unidades" onClose={onClose} tone="brown" />}
      footer={
        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn flex-1">Fechar</button>
        </ModalFooter>
      }
    >
      <p className="mb-3 text-[0.8rem] text-[var(--text-muted)]">
        Cadastre as lojas uma vez. Ao criar um gerente ou colaborador, a loja é sugerida automaticamente.
      </p>

      <form onSubmit={add} className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="adm-label" htmlFor="lj-nome">Nome da loja</label>
          <input id="lj-nome" className="adm-input" value={nome} autoFocus
            onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Vila Nova" />
        </div>
        <button type="submit" disabled={!nome.trim()} className="adm-btn adm-btn--primary h-9 shrink-0 disabled:opacity-50">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </form>

      {lojas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)]">
          <EmptyState icon={Store} title="Nenhuma loja cadastrada" hint="Adicione a primeira loja acima." compact />
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {lojas.map((l) => (
            <li key={l} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2">
              <span className="flex items-center gap-2 text-[0.85rem] font-medium text-[var(--ink)]">
                <Store className="h-3.5 w-3.5 text-[var(--brand-brown)]" /> {l}
              </span>
              <button type="button" onClick={() => removeLoja(l)} aria-label={`Remover ${l}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]">
                <Trash2 className="h-[15px] w-[15px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  )
}
