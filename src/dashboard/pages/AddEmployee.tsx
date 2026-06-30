import { useState } from 'react'
import { Copy, Check, UserPlus, Loader2, MessageCircle } from 'lucide-react'
import { ROLES, type Role, type Employee } from '@/lib/types'
import { preRegisterEmployee } from '@/lib/storage'
import { employeeLink } from '../data'

export default function AddEmployee() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<Employee | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role) {
      setError('Informe ao menos o nome e o cargo.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const emp = await preRegisterEmployee({ name: name.trim(), phone: phone.trim(), role: role as Role })
      setCreated(emp)
    } catch {
      setError('Não foi possível cadastrar agora. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setCreated(null)
    setName('')
    setPhone('')
    setRole('')
  }

  const link = created ? employeeLink(created.token) : ''

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const whatsappUrl = created
    ? `https://wa.me/${created.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá, ${created.name}! Bem-vindo(a) à Pralís 🌾 Acesse seu Código de Conduta: ${link}`,
      )}`
    : '#'

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl text-pralis-branco">Adicionar colaborador</h1>
      <p className="mt-1 font-body text-sm text-pralis-creme/60">
        Cadastre e gere um link único de acesso (sem senha).
      </p>

      {!created ? (
        <form
          onSubmit={submit}
          className="mt-6 flex flex-col gap-4 rounded-card border border-pralis-marrom-lk/50 bg-pralis-marrom-dk/40 p-6"
        >
          <Field label="Nome completo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dash"
              placeholder="Nome do colaborador"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="input-dash"
              placeholder="(00) 00000-0000"
            />
          </Field>
          <Field label="Cargo">
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input-dash">
              <option value="" disabled>
                Selecione…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          {error && <p className="font-body text-sm text-pralis-vermelho">{error}</p>}

          <button type="submit" disabled={busy} className="btn-laranja w-full">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : (<><UserPlus className="h-5 w-5" /> Gerar link</>)}
          </button>
        </form>
      ) : (
        <div className="mt-6 flex flex-col gap-4 rounded-card border border-pralis-verde/40 bg-pralis-verde/5 p-6">
          <div className="flex items-center gap-2 font-display text-xl text-pralis-verde">
            <Check className="h-6 w-6" /> {created.name} cadastrado!
          </div>
          <div>
            <p className="mb-1 font-body text-sm font-semibold text-pralis-creme">Link único de acesso</p>
            <div className="flex items-center gap-2 rounded-xl border border-pralis-marrom-lk bg-pralis-marrom-dk/60 px-3 py-2.5">
              <span className="flex-1 truncate font-body text-sm text-pralis-creme/80">{link}</span>
              <button onClick={copy} className="flex items-center gap-1 rounded-lg bg-pralis-laranja/20 px-2.5 py-1 text-xs font-semibold text-pralis-laranja">
                {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AccessBox label="ID de acesso" value={created.token} />
            <AccessBox label="Senha" value={created.access_code ?? 'Sem senha'} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {created.phone && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-laranja flex-1">
                <MessageCircle className="h-5 w-5" /> Enviar no WhatsApp
              </a>
            )}
            <button onClick={reset} className="btn-ghost flex-1">
              Cadastrar outro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm font-semibold text-pralis-creme">{label}</span>
      {children}
    </label>
  )
}

function AccessBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-pralis-marrom-lk/70 bg-pralis-marrom-dk/40 p-3">
      <p className="font-body text-[11px] font-bold uppercase tracking-[0.12em] text-pralis-creme/50">{label}</p>
      <p className="mt-1 break-all font-body text-sm font-black text-pralis-branco">{value}</p>
    </div>
  )
}
