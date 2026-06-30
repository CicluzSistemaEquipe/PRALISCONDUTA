import { useState, type CSSProperties } from 'react'
import { List } from 'lucide-react'

/**
 * Seletor de Cargo confiável (mesmo padrão do LojaSelect). Lista os cargos
 * cadastrados (ativos) + a opção "+ Novo cargo…" que revela um campo de texto.
 * O valor é o NOME do cargo (gravado em Employee.role). Valor legado fora da
 * lista vira opção própria — nada se perde na edição.
 */
export function CargoSelect({ id, value, onChange, cargos, style }: {
  id?: string
  value: string
  onChange: (v: string) => void
  cargos: string[]
  style?: CSSProperties
}) {
  const [typing, setTyping] = useState(false)
  const known = Boolean(value) && cargos.includes(value)

  if (typing) {
    return (
      <div className="flex items-center gap-2">
        <input id={id} className="adm-input" autoFocus style={style} placeholder="Nome do novo cargo"
          value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => setTyping(false)} title="Escolher da lista"
          aria-label="Escolher um cargo da lista" className="adm-btn h-9 shrink-0 px-2.5">
          <List className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <select id={id} className="adm-input" style={style} value={value}
      onChange={(e) => {
        const v = e.target.value
        if (v === '__new__') { setTyping(true); onChange('') }
        else onChange(v)
      }}>
      <option value="">Selecione…</option>
      {!known && value && <option value={value}>{value}</option>}
      {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
      <option value="__new__">+ Novo cargo…</option>
    </select>
  )
}
