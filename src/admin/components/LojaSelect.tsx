import { useState, type CSSProperties } from 'react'
import { List } from 'lucide-react'

/**
 * Seletor de Loja confiável (substitui o datalist, que selecionava mal e mostrava
 * tooltip nativo). Lista as lojas cadastradas + a opção "+ Nova loja…" que revela
 * um campo de texto. Mantém compatibilidade: um valor legado fora da lista vira
 * uma opção própria, então nada se perde na edição.
 */
export function LojaSelect({ id, value, onChange, lojas, style }: {
  id?: string
  value: string
  onChange: (v: string) => void
  lojas: string[]
  style?: CSSProperties
}) {
  const [typing, setTyping] = useState(false)
  const known = Boolean(value) && lojas.includes(value)

  if (typing) {
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          className="adm-input"
          autoFocus
          style={style}
          placeholder="Nome da nova loja"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setTyping(false)}
          title="Escolher da lista"
          aria-label="Escolher uma loja da lista"
          className="adm-btn h-9 shrink-0 px-2.5"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <select
      id={id}
      className="adm-input"
      style={style}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        if (v === '__new__') { setTyping(true); onChange('') }
        else onChange(v)
      }}
    >
      <option value="">Sem loja</option>
      {!known && value && <option value={value}>{value}</option>}
      {lojas.map((l) => <option key={l} value={l}>{l}</option>)}
      <option value="__new__">+ Nova loja…</option>
    </select>
  )
}
