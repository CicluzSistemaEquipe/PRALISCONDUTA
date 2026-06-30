import { useEffect, useRef, useState, useMemo, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Copy, Check, X, Search, MessageCircle, Link2, CheckCircle2,
  UserPlus, Pencil, Trash2, AlertTriangle, Save, Camera, User, Briefcase,
  Mail, Phone, CalendarDays, Building2, ShieldCheck, FileSignature, Clock, IdCard,
  CalendarClock, Bell, BellOff,
} from 'lucide-react'
import { createEmployee, updateEmployee, deleteEmployee } from '@/lib/storage'
import { loadEmployeeRows, type EmployeeRow } from '@/dashboard/data'
import { ROLES, type Role, type AdminUser, type EmployeeStatus, type Turno, type Weekday } from '@/lib/types'
import { getAdminSession, isDono, listGerentes } from '../auth'
import { enviarNotificacao } from '@/lib/notifications'
import { fileToDownscaledDataURL, ALLOWED_LABEL } from '@/lib/image'
import { useLojas, addLoja } from '@/lib/lojas'
import { useCargos, addCargo } from '@/lib/cargos'
import { LojaSelect } from '../components/LojaSelect'
import { CargoSelect } from '../components/CargoSelect'
import { CargosManager } from '../components/CargosManager'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatusBadge, statusOf } from '../components/StatusBadge'
import { EmptyState, Skeleton, Avatar, ModalShell, ModalHeader, ModalFooter, ModalSection } from '../components/ui'

// ── helpers ─────────────────────────────────────────────────────────────────
export function acessoLink(id: string) {
  return `${window.location.origin}/acesso?id=${encodeURIComponent(id)}`
}
export function waLink(name: string, link: string) {
  const msg = `Olá, ${name.split(' ')[0]}! 👋\n\nAqui está o seu link de acesso ao treinamento da Padaria Pralís:\n\n${link}\n\nClique no link para começar a sua jornada! 🥐`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}
function maskCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}
const rawCPF = (v: string) => v.replace(/\D/g, '')
const todayISO = () => new Date().toISOString().slice(0, 10)
const quizPctOf = (r: EmployeeRow) => (r.quizTotal > 0 ? Math.round((r.quizCorrect / r.quizTotal) * 100) : null)

// ── Modal: novo colaborador ──────────────────────────────────────────────────
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// Seletor de foto circular reutilizável (reaproveita o downscaler de imagem).
function PhotoField({ name, avatarUrl, busy, onPick, onRemove, label }: {
  name: string; avatarUrl?: string; busy: boolean; onPick: (f?: File) => void; onRemove: () => void; label: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <Avatar name={name || label} size={56} src={avatarUrl} />
        <button type="button" onClick={() => ref.current?.click()} disabled={busy} aria-label="Alterar foto"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60">
          <Camera className="h-3 w-3" />
        </button>
      </div>
      <div className="min-w-0">
        <p className="text-[0.82rem] font-semibold text-[var(--ink)]">{label}</p>
        <p className="text-[0.72rem] text-[var(--text-muted)]">{busy ? 'Processando…' : ALLOWED_LABEL}</p>
        {avatarUrl && (
          <button type="button" onClick={onRemove} className="mt-0.5 text-[0.72rem] font-semibold text-[var(--danger)] hover:underline">Remover foto</button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
    </div>
  )
}

// ── Jornada e comunicação (estrutura p/ futuras automações — sem push agora) ──
const TURNOS: { id: Turno; label: string }[] = [
  { id: 'manha', label: 'Manhã' }, { id: 'tarde', label: 'Tarde' }, { id: 'noite', label: 'Noite' },
  { id: 'integral', label: 'Integral' }, { id: 'variavel', label: 'Variável' },
]
const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' }, { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' }, { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
]
const turnoLabel = (t?: Turno) => TURNOS.find((x) => x.id === t)?.label ?? '—'
const diasResumo = (d?: Weekday[]) => (d && d.length ? WEEKDAYS.filter((w) => d.includes(w.id)).map((w) => w.label).join(' · ') : '—')

interface JornadaValues {
  turno: Turno | ''
  horaEntrada: string
  horaSaida: string
  diasTrabalho: Weekday[]
  folgas: string
  melhorHorarioNotificacao: string
  recebeNotificacoes: boolean
}

function JornadaFields({ idp, v, set }: { idp: string; v: JornadaValues; set: (p: Partial<JornadaValues>) => void }) {
  const toggleDia = (d: Weekday) =>
    set({ diasTrabalho: v.diasTrabalho.includes(d) ? v.diasTrabalho.filter((x) => x !== d) : [...v.diasTrabalho, d] })
  const chip = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
      active ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
        : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="adm-label">Turno</span>
        <div className="flex flex-wrap gap-2">
          {TURNOS.map((t) => (
            <button key={t.id} type="button" aria-pressed={v.turno === t.id}
              onClick={() => set({ turno: v.turno === t.id ? '' : t.id })} className={chip(v.turno === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="adm-label" htmlFor={`${idp}-ent`}>Horário de entrada</label>
          <input id={`${idp}-ent`} type="time" className="adm-input" value={v.horaEntrada} onChange={(e) => set({ horaEntrada: e.target.value })} />
        </div>
        <div>
          <label className="adm-label" htmlFor={`${idp}-sai`}>Horário de saída</label>
          <input id={`${idp}-sai`} type="time" className="adm-input" value={v.horaSaida} onChange={(e) => set({ horaSaida: e.target.value })} />
        </div>
      </div>

      <div>
        <span className="adm-label">Dias trabalhados</span>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => {
            const on = v.diasTrabalho.includes(d.id)
            return (
              <button key={d.id} type="button" aria-pressed={on} onClick={() => toggleDia(d.id)}
                className={`h-9 w-11 rounded-lg border text-[0.8rem] font-semibold transition-colors ${
                  on ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)]'
                    : 'border-[var(--border-strong)] bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}>
                {d.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="adm-label" htmlFor={`${idp}-folgas`}>Folgas</label>
        <input id={`${idp}-folgas`} className="adm-input" placeholder="Ex.: domingos e feriados"
          value={v.folgas} onChange={(e) => set({ folgas: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="adm-label" htmlFor={`${idp}-mh`}>Melhor horário p/ notificações</label>
          <input id={`${idp}-mh`} type="time" className="adm-input" value={v.melhorHorarioNotificacao} onChange={(e) => set({ melhorHorarioNotificacao: e.target.value })} />
        </div>
        <div>
          <span className="adm-label">Recebe notificações</span>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" aria-pressed={v.recebeNotificacoes} onClick={() => set({ recebeNotificacoes: true })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[0.82rem] font-semibold transition-colors ${
                v.recebeNotificacoes ? 'border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white'}`}>
              <Bell className="h-3.5 w-3.5" /> Sim
            </button>
            <button type="button" aria-pressed={!v.recebeNotificacoes} onClick={() => set({ recebeNotificacoes: false })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[0.82rem] font-semibold transition-colors ${
                !v.recebeNotificacoes ? 'border-[var(--border-strong)] bg-[var(--bg-muted)] text-[var(--text-secondary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-white'}`}>
              <BellOff className="h-3.5 w-3.5" /> Não
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NovoColaboradorModal({ onClose, onSaved, gerentes, defaultGerenteId, lockGerente }: {
  onClose: () => void
  onSaved: (emp: { name: string; role: string; link: string }) => void
  gerentes: AdminUser[]
  defaultGerenteId: string
  lockGerente: boolean
}) {
  const [form, setForm] = useState({
    name: '', nomePublico: '', cpf: '', whatsapp: '', email: '', birth: '', admission: todayISO(),
    role: ROLES[0] as Role, status: 'ativo' as EmployeeStatus, store: '', gerenteId: defaultGerenteId,
    descricao: '', avatarUrl: undefined as string | undefined,
    turno: '' as Turno | '', horaEntrada: '', horaSaida: '', diasTrabalho: [] as Weekday[],
    folgas: '', melhorHorarioNotificacao: '', recebeNotificacoes: true,
  })
  const [err, setErr] = useState('')
  const [imgBusy, setImgBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const lojas = useLojas()
  const cargoNomes = useCargos().filter((c) => c.ativo !== false).map((c) => c.nome)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const handlePhoto = async (file?: File) => {
    if (!file) return
    setErr(''); setImgBusy(true)
    try { const res = await fileToDownscaledDataURL(file); set({ avatarUrl: res.dataUrl }) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Falha ao processar a imagem.') }
    finally { setImgBusy(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const cpf = rawCPF(form.cpf)
    if (!name) { setErr('Informe o nome do colaborador.'); return }
    if (cpf.length !== 11) { setErr('CPF inválido — informe os 11 dígitos.'); return }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) { setErr('E-mail inválido.'); return }
    setSaving(true)
    if (form.store.trim()) addLoja(form.store)
    if (form.role.trim() && !cargoNomes.includes(form.role)) addCargo({ nome: form.role })
    try {
      const emp = await createEmployee({
        name, phone: cpf, role: form.role, gerenteId: form.gerenteId || undefined,
        whatsapp: form.whatsapp.replace(/\D/g, '') || undefined,
        email: form.email.trim() || undefined,
        birth_date: form.birth || undefined,
        admission_date: form.admission || undefined,
        store: form.store.trim() || undefined,
        status: form.status,
        nomePublico: form.nomePublico.trim() || undefined,
        descricao: form.descricao.trim() || undefined,
        avatarUrl: form.avatarUrl,
        turno: form.turno || undefined,
        horaEntrada: form.horaEntrada || undefined,
        horaSaida: form.horaSaida || undefined,
        diasTrabalho: form.diasTrabalho.length ? form.diasTrabalho : undefined,
        folgas: form.folgas.trim() || undefined,
        melhorHorarioNotificacao: form.melhorHorarioNotificacao || undefined,
        recebeNotificacoes: form.recebeNotificacoes,
      })
      const gerente = gerentes.find((g) => g.id === form.gerenteId)
      void enviarNotificacao({
        tipo: 'colaborador_novo', colaboradorNome: emp.name, colaboradorId: emp.id,
        gerenteNome: gerente?.nome, gerenteEmail: gerente?.email, data: new Date().toISOString(), extra: { cargo: emp.role },
      })
      onSaved({ name: emp.name, role: emp.role, link: acessoLink(emp.id) })
    } catch {
      setErr('Erro ao cadastrar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <ModalShell
      onClose={onClose}
      size="md"
      header={<ModalHeader icon={UserPlus} eyebrow="Pessoas" title="Novo colaborador" onClose={onClose} />}
      footer={
        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn flex-1">Cancelar</button>
          <button type="submit" form="colab-form" disabled={saving} className="adm-btn adm-btn--primary flex-[2]">
            {saving ? 'Cadastrando…' : <><UserPlus className="h-[18px] w-[18px]" strokeWidth={2} /> Cadastrar colaborador</>}
          </button>
        </ModalFooter>
      }
    >
      <form id="colab-form" onSubmit={submit} className="flex flex-col gap-4">
        <ModalSection title="Identificação" description="Quem é o colaborador e como ele aparece no app." icon={IdCard} tone="orange">
          <div className="flex flex-col gap-4">
            <PhotoField name={form.name} avatarUrl={form.avatarUrl} busy={imgBusy} label="Foto do colaborador"
              onPick={handlePhoto} onRemove={() => set({ avatarUrl: undefined })} />
            <div>
              <label className="adm-label" htmlFor="nc-nome">Nome completo</label>
              <input id="nc-nome" className="adm-input" autoFocus placeholder="Ex.: Marina Souza"
                value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div>
              <label className="adm-label" htmlFor="nc-pub">Nome público <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <input id="nc-pub" className="adm-input" placeholder="Ex.: Marina"
                value={form.nomePublico} onChange={(e) => set({ nomePublico: e.target.value })} />
              <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">Nome exibido no app. Em branco, usamos o primeiro nome.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="nc-cpf">CPF</label>
                <input id="nc-cpf" className="adm-input" inputMode="numeric" placeholder="000.000.000-00"
                  value={form.cpf} onChange={(e) => set({ cpf: maskCPF(e.target.value) })} />
              </div>
              <div>
                <label className="adm-label" htmlFor="nc-wa">WhatsApp</label>
                <input id="nc-wa" className="adm-input" inputMode="tel" placeholder="(00) 00000-0000"
                  value={form.whatsapp} onChange={(e) => set({ whatsapp: maskPhone(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="nc-email">E-mail <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <input id="nc-email" type="email" className="adm-input" placeholder="nome@exemplo.com"
                value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Cargo e vínculo" description="Função, situação e a quem responde." icon={Briefcase} tone="gold">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="nc-role">Cargo</label>
                <CargoSelect id="nc-role" value={form.role} onChange={(v) => set({ role: v })} cargos={cargoNomes} />
              </div>
              <div>
                <label className="adm-label" htmlFor="nc-status">Situação</label>
                <select id="nc-status" className="adm-input" value={form.status} onChange={(e) => set({ status: e.target.value as EmployeeStatus })}>
                  <option value="ativo">Ativo</option>
                  <option value="afastado">Afastado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="nc-store">Loja/Unidade <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
                <LojaSelect id="nc-store" value={form.store} onChange={(v) => set({ store: v })} lojas={lojas} />
              </div>
              <div>
                <label className="adm-label" htmlFor="nc-ger">Gerente responsável</label>
                <select id="nc-ger" className="adm-input" value={form.gerenteId} disabled={lockGerente}
                  onChange={(e) => set({ gerenteId: e.target.value })}>
                  <option value="">Sem gerente</option>
                  {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="nc-birth">Nascimento</label>
                <input id="nc-birth" type="date" className="adm-input" value={form.birth} onChange={(e) => set({ birth: e.target.value })} />
              </div>
              <div>
                <label className="adm-label" htmlFor="nc-admission">Admissão</label>
                <input id="nc-admission" type="date" className="adm-input" value={form.admission} onChange={(e) => set({ admission: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="nc-desc">Descrição curta <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <textarea id="nc-desc" className="adm-input" rows={2} placeholder="Ex.: Atendimento do balcão, turno da manhã."
                value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Jornada e comunicação"
          description="Usado futuramente para automatizar lembretes, avisos, mensagens e notificações no melhor horário para cada colaborador."
          icon={CalendarClock} tone="gold">
          <JornadaFields idp="nc" v={form} set={set} />
        </ModalSection>

        <div className="flex items-start gap-2.5 rounded-lg bg-[var(--bg-subtle)] px-3.5 py-3">
          <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.8} />
          <p className="text-[0.8125rem] leading-relaxed text-[var(--text-muted)]">
            Após o cadastro, um link único é gerado. Você poderá enviá-lo pelo WhatsApp — ao clicar, o colaborador entra autenticado no treinamento.
          </p>
        </div>

        {err && <p className="text-[0.8125rem] font-medium text-[var(--danger)]">{err}</p>}
      </form>
    </ModalShell>
  )
}

// ── Modal: editar / excluir ──────────────────────────────────────────────────
function EditColaboradorModal({ row, onClose, onSaved, onDeleted, gerentes, lockGerente }: {
  row: EmployeeRow; onClose: () => void; onSaved: () => void; onDeleted: () => void; gerentes: AdminUser[]; lockGerente: boolean
}) {
  const emp = row.employee
  const [form, setForm] = useState({
    name: emp.name, nomePublico: emp.nomePublico ?? '', cpf: maskCPF(emp.phone ?? ''),
    whatsapp: emp.whatsapp ? maskPhone(emp.whatsapp) : '', email: emp.email ?? '',
    birth: emp.birth_date ?? '', admission: emp.admission_date ?? '',
    store: emp.store ?? '', status: (emp.status ?? 'ativo') as EmployeeStatus,
    role: emp.role as Role, gerenteId: emp.gerenteId ?? '',
    descricao: emp.descricao ?? '', avatarUrl: emp.avatarUrl as string | undefined,
    turno: (emp.turno ?? '') as Turno | '', horaEntrada: emp.horaEntrada ?? '', horaSaida: emp.horaSaida ?? '',
    diasTrabalho: (emp.diasTrabalho ?? []) as Weekday[], folgas: emp.folgas ?? '',
    melhorHorarioNotificacao: emp.melhorHorarioNotificacao ?? '', recebeNotificacoes: emp.recebeNotificacoes ?? true,
  })
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))
  const lojas = useLojas()
  const cargoNomes = useCargos().filter((c) => c.ativo !== false).map((c) => c.nome)
  const [saving, setSaving] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [err, setErr] = useState('')
  const link = acessoLink(emp.id)

  const handlePhoto = async (file?: File) => {
    if (!file) return
    setErr(''); setImgBusy(true)
    try { const res = await fileToDownscaledDataURL(file); set({ avatarUrl: res.dataUrl }) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Falha ao processar a imagem.') }
    finally { setImgBusy(false) }
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const cpf = rawCPF(form.cpf)
    if (!name) { setErr('Informe o nome.'); return }
    if (cpf.length !== 11) { setErr('CPF inválido.'); return }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) { setErr('E-mail inválido.'); return }
    setSaving(true)
    if (form.store.trim()) addLoja(form.store)
    if (form.role.trim() && !cargoNomes.includes(form.role)) addCargo({ nome: form.role })
    try {
      await updateEmployee(emp.id, {
        name, phone: cpf, role: form.role, gerenteId: form.gerenteId || undefined,
        whatsapp: form.whatsapp.replace(/\D/g, '') || undefined,
        email: form.email.trim() || undefined,
        birth_date: form.birth || undefined,
        admission_date: form.admission || undefined,
        store: form.store.trim() || undefined,
        status: form.status,
        nomePublico: form.nomePublico.trim() || undefined,
        descricao: form.descricao.trim() || undefined,
        avatarUrl: form.avatarUrl,
        turno: form.turno || undefined,
        horaEntrada: form.horaEntrada || undefined,
        horaSaida: form.horaSaida || undefined,
        diasTrabalho: form.diasTrabalho.length ? form.diasTrabalho : undefined,
        folgas: form.folgas.trim() || undefined,
        melhorHorarioNotificacao: form.melhorHorarioNotificacao || undefined,
        recebeNotificacoes: form.recebeNotificacoes,
      })
      onSaved()
    } catch {
      setErr('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  const remove = async () => {
    setDeleting(true)
    try { await deleteEmployee(emp.id); onDeleted() } catch { setDeleting(false); setConfirm(false) }
  }

  return (
    <ModalShell
      onClose={onClose}
      size="md"
      header={<ModalHeader icon={Pencil} eyebrow="Editar cadastro" title={emp.name} onClose={onClose} />}
      footer={
        <ModalFooter>
          <button type="button" onClick={onClose} className="adm-btn flex-1">Cancelar</button>
          <button type="submit" form="colab-edit" disabled={saving} className="adm-btn adm-btn--primary flex-[2]">
            {saving ? 'Salvando…' : <><Save className="h-[18px] w-[18px]" strokeWidth={2} /> Salvar alterações</>}
          </button>
        </ModalFooter>
      }
    >
      <form id="colab-edit" onSubmit={save} className="flex flex-col gap-4">
        <ModalSection title="Identificação" description="Dados pessoais e como aparece no app." icon={IdCard} tone="orange">
          <div className="flex flex-col gap-4">
            <PhotoField name={form.name} avatarUrl={form.avatarUrl} busy={imgBusy} label="Foto do colaborador"
              onPick={handlePhoto} onRemove={() => set({ avatarUrl: undefined })} />
            <div>
              <label className="adm-label" htmlFor="ed-nome">Nome completo</label>
              <input id="ed-nome" className="adm-input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div>
              <label className="adm-label" htmlFor="ed-pub">Nome público <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <input id="ed-pub" className="adm-input" placeholder="Ex.: Marina" value={form.nomePublico} onChange={(e) => set({ nomePublico: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="ed-cpf">CPF</label>
                <input id="ed-cpf" className="adm-input" inputMode="numeric" value={form.cpf} onChange={(e) => set({ cpf: maskCPF(e.target.value) })} />
              </div>
              <div>
                <label className="adm-label" htmlFor="ed-wa">WhatsApp</label>
                <input id="ed-wa" className="adm-input" inputMode="tel" placeholder="(00) 00000-0000" value={form.whatsapp} onChange={(e) => set({ whatsapp: maskPhone(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="ed-email">E-mail <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <input id="ed-email" type="email" className="adm-input" placeholder="nome@exemplo.com" value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Cargo e vínculo" description="Função, situação e a quem responde." icon={Briefcase} tone="gold">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="ed-role">Cargo</label>
                <CargoSelect id="ed-role" value={form.role} onChange={(v) => set({ role: v })} cargos={cargoNomes} />
              </div>
              <div>
                <label className="adm-label" htmlFor="ed-status">Situação</label>
                <select id="ed-status" className="adm-input" value={form.status} onChange={(e) => set({ status: e.target.value as EmployeeStatus })}>
                  <option value="ativo">Ativo</option>
                  <option value="afastado">Afastado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="ed-store">Loja/Unidade</label>
                <LojaSelect id="ed-store" value={form.store} onChange={(v) => set({ store: v })} lojas={lojas} />
              </div>
              <div>
                <label className="adm-label" htmlFor="ed-ger">Gerente responsável</label>
                <select id="ed-ger" className="adm-input" value={form.gerenteId} disabled={lockGerente}
                  onChange={(e) => set({ gerenteId: e.target.value })}>
                  <option value="">Sem gerente</option>
                  {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="ed-birth">Nascimento</label>
                <input id="ed-birth" type="date" className="adm-input" value={form.birth} onChange={(e) => set({ birth: e.target.value })} />
              </div>
              <div>
                <label className="adm-label" htmlFor="ed-admission">Admissão</label>
                <input id="ed-admission" type="date" className="adm-input" value={form.admission} onChange={(e) => set({ admission: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="adm-label" htmlFor="ed-desc">Descrição curta <span className="font-normal text-[var(--text-muted)]">(opcional)</span></label>
              <textarea id="ed-desc" className="adm-input" rows={2} value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Jornada e comunicação"
          description="Usado futuramente para automatizar lembretes, avisos, mensagens e notificações no melhor horário para cada colaborador."
          icon={CalendarClock} tone="gold">
          <JornadaFields idp="ed" v={form} set={set} />
        </ModalSection>

        <div>
          <label className="adm-label">Link de acesso</label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2">
            <span className="flex-1 truncate font-mono text-xs text-[var(--text-secondary)]">{link}</span>
            <a href={waLink(emp.name, link)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#cdebd9] bg-[#ecf7f0] px-2.5 py-1 text-xs font-semibold text-[#1e7e4e]">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>

        {err && <p className="text-[0.8125rem] font-medium text-[var(--danger)]">{err}</p>}

        {/* zona de perigo — min-height fixa evita o modal "pular" ao confirmar */}
        <div className="rounded-xl border border-[#f3d2cd] bg-[var(--danger-bg)] p-4">
          <AnimatePresence mode="wait" initial={false}>
            {!confirm ? (
              <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex min-h-[40px] items-center justify-between gap-3">
                <div>
                  <p className="text-[0.8125rem] font-semibold text-[var(--danger)]">Excluir colaborador</p>
                  <p className="text-[0.75rem] text-[var(--text-muted)]">Remove o cadastro e todo o progresso.</p>
                </div>
                <button type="button" onClick={() => setConfirm(true)} className="adm-btn adm-btn--danger shrink-0">
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </motion.div>
            ) : (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
                  <p className="text-[0.875rem] font-semibold text-[var(--danger)]">Confirma a exclusão de {emp.name}?</p>
                </div>
                <p className="mb-3 text-[0.8125rem] text-[var(--text-muted)]">Progresso, quizzes e assinatura serão apagados permanentemente.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirm(false)} className="adm-btn flex-1">Cancelar</button>
                  <button type="button" onClick={remove} disabled={deleting}
                    className="adm-btn flex-[2] border-[var(--danger)] bg-[var(--danger)] text-white hover:bg-[#a93226]">
                    {deleting ? 'Excluindo…' : <><Trash2 className="h-4 w-4" /> Sim, excluir</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </ModalShell>
  )
}

// ── Modal: sucesso + link ────────────────────────────────────────────────────
function SuccessModal({ name, role, link, onClose }: { name: string; role: string; link: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <ModalShell onClose={onClose} size="sm">
      <div className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ecf7f0]">
          <CheckCircle2 className="h-7 w-7 text-[#1e7e4e]" strokeWidth={1.9} />
        </motion.div>
        <h2 className="text-[1.2rem] font-semibold text-[var(--ink)]">Colaborador cadastrado!</h2>
        <p className="mx-auto mt-1 max-w-xs text-[0.875rem] text-[var(--text-muted)]">
          O link de acesso de <strong className="text-[var(--ink)]">{name}</strong> foi gerado. Envie pelo WhatsApp para ele começar.
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
        <Avatar name={name} size={40} />
        <div className="min-w-0">
          <p className="truncate text-[0.875rem] font-semibold text-[var(--ink)]">{name}</p>
          <p className="text-[0.8125rem] text-[var(--text-muted)]">{role}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5">
        <Link2 className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.8} />
        <span className="flex-1 truncate font-mono text-xs text-[var(--text-secondary)]">{link}</span>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={copy} className="adm-btn flex-1">
          {copied ? <><Check className="h-4 w-4 text-[var(--success)]" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar link</>}
        </button>
        <a href={waLink(name, link)} target="_blank" rel="noreferrer"
          className="adm-btn adm-btn--primary flex-[1.4] no-underline">
          <MessageCircle className="h-4 w-4" /> Enviar no WhatsApp
        </a>
      </div>
      <button onClick={onClose} className="adm-btn adm-btn--ghost mt-2 w-full">Fechar</button>
    </ModalShell>
  )
}

// ── helpers de exibição ──────────────────────────────────────────────────────
function fmtDate(d?: string | null) {
  if (!d) return '—'
  const dt = d.length === 10 ? new Date(d + 'T00:00:00') : new Date(d)
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
const STATUS_META: Record<EmployeeStatus, { label: string; cls: string }> = {
  ativo: { label: 'Ativo', cls: 'border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]' },
  afastado: { label: 'Afastado', cls: 'border-[#f5e2c0] bg-[#fdf4e3] text-[#9a6b15]' },
  inativo: { label: 'Inativo', cls: 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)]' },
}
function StatusPill({ status }: { status?: EmployeeStatus }) {
  const m = STATUS_META[status ?? 'ativo']
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${m.cls}`}>{m.label}</span>
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" strokeWidth={1.8} />
      <span className="w-28 shrink-0 text-[0.78rem] text-[var(--text-muted)]">{label}</span>
      <span className="min-w-0 flex-1 truncate text-[0.85rem] font-medium text-[var(--ink)]">{value || '—'}</span>
    </div>
  )
}

// ── Modal: visão 360° do colaborador (interligado, reutilizável) ─────────────
export function ColaboradorDetailModal({ row, gerenteName, onClose, onEdit, onCopy, copied }: {
  row: EmployeeRow; gerenteName?: string
  onClose: () => void; onEdit?: (r: EmployeeRow) => void; onCopy: (link: string, id: string) => void; copied: string | null
}) {
  const emp = row.employee
  const link = acessoLink(emp.id)
  const isCopied = copied === emp.id
  const pct = Math.round(row.progress * 100)
  const pending = Math.max(0, row.totalModules - row.completedModules)
  const quizPct = quizPctOf(row)
  const emDia = pending === 0 && row.signed

  return (
    <ModalShell
      onClose={onClose}
      size="lg"
      header={
        <div className="flex items-start justify-between gap-3 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={emp.name} size={48} src={emp.avatarUrl} />
            <div className="min-w-0">
              <h2 className="truncate text-[1.15rem] font-semibold text-[var(--ink)]">{emp.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="adm-badge adm-badge--muted">{emp.role}</span>
                <StatusPill status={emp.status} />
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      }
      footer={
        <ModalFooter>
          <button onClick={() => onCopy(link, emp.id)} className="adm-btn flex-1">
            {isCopied ? <><Check className="h-4 w-4 text-[var(--success)]" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar link</>}
          </button>
          <a href={waLink(emp.name, link)} target="_blank" rel="noopener noreferrer"
            className="adm-btn flex-1 no-underline border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          {onEdit && (
            <button onClick={() => onEdit(row)} className="adm-btn adm-btn--primary flex-1">
              <Pencil className="h-4 w-4" /> Editar
            </button>
          )}
        </ModalFooter>
      }
    >
      {/* situação do treinamento */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="adm-eyebrow">Treinamento</span>
          <StatusBadge status={statusOf(row)} />
        </div>
        <div className="flex items-center gap-3">
          <div className="adm-pbar flex-1"><i style={{ width: `${pct}%` }} /></div>
          <span className="text-sm font-semibold text-[var(--ink)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white px-2 py-2">
            <p className="text-[1.05rem] font-bold text-[var(--ink)]">{pct}%</p>
            <p className="text-[0.68rem] text-[var(--text-muted)]">Concluído</p>
          </div>
          <div className="rounded-lg bg-white px-2 py-2">
            <p className="text-[1.05rem] font-bold text-[var(--ink)]">{quizPct != null ? `${quizPct}%` : '—'}</p>
            <p className="text-[0.68rem] text-[var(--text-muted)]">Acerto quiz</p>
          </div>
          <div className="rounded-lg bg-white px-2 py-2">
            <p className="text-[1.05rem] font-bold text-[var(--ink)]">{pending}</p>
            <p className="text-[0.68rem] text-[var(--text-muted)]">Pendentes</p>
          </div>
        </div>
      </div>

      {/* assinatura + pendências */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] p-3.5">
          <div className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.8} />
            <span className="adm-eyebrow">Assinatura</span>
          </div>
          {row.signed ? (
            <p className="mt-1.5 text-[0.85rem] font-medium text-[#1e7e4e]">Assinada · {fmtDate(row.signedAt)}</p>
          ) : (
            <p className="mt-1.5 text-[0.85rem] font-medium text-[var(--text-secondary)]">Ainda não assinou</p>
          )}
        </div>
        <div className={`rounded-xl border p-3.5 ${emDia ? 'border-[#cdebd9] bg-[#ecf7f0]' : 'border-[#f5e2c0] bg-[#fdf4e3]'}`}>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${emDia ? 'text-[#1e7e4e]' : 'text-[#9a6b15]'}`} strokeWidth={1.8} />
            <span className="adm-eyebrow">Pendências</span>
          </div>
          <p className={`mt-1.5 text-[0.85rem] font-medium ${emDia ? 'text-[#1e7e4e]' : 'text-[#9a6b15]'}`}>
            {emDia ? 'Em dia — tudo concluído' : [pending > 0 ? `${pending} módulo(s)` : null, !row.signed ? 'assinatura' : null].filter(Boolean).join(' + ')}
          </p>
        </div>
      </div>

      {/* identificação */}
      <div className="mt-4">
        <span className="adm-eyebrow">Identificação</span>
        <div className="mt-1 divide-y divide-[var(--border)]">
          {emp.nomePublico && <InfoRow icon={User} label="Nome público" value={emp.nomePublico} />}
          <InfoRow icon={IdCard} label="CPF" value={emp.phone ? maskCPF(emp.phone) : '—'} />
          <InfoRow icon={Phone} label="WhatsApp" value={emp.whatsapp ? maskPhone(emp.whatsapp) : '—'} />
          <InfoRow icon={Mail} label="E-mail" value={emp.email} />
          <InfoRow icon={CalendarDays} label="Nascimento" value={fmtDate(emp.birth_date)} />
          <InfoRow icon={CalendarDays} label="Admissão" value={fmtDate(emp.admission_date)} />
          <InfoRow icon={Building2} label="Loja" value={emp.store} />
          <InfoRow icon={ShieldCheck} label="Gerente" value={gerenteName} />
          <InfoRow icon={Link2} label="Código" value={<span className="font-mono">{emp.access_code ?? '—'}</span>} />
        </div>
        {emp.descricao && (
          <p className="mt-3 rounded-lg bg-[var(--bg-subtle)] px-3 py-2.5 text-[0.82rem] leading-relaxed text-[var(--text-secondary)]">
            {emp.descricao}
          </p>
        )}
      </div>

      {/* jornada (discreto) — turno · horário · dias · notificações */}
      {(emp.turno || emp.horaEntrada || emp.horaSaida || (emp.diasTrabalho?.length ?? 0) > 0 || emp.recebeNotificacoes !== undefined) && (
        <div className="mt-4">
          <span className="adm-eyebrow">Jornada</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {emp.turno && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[0.75rem] font-medium text-[var(--text-secondary)]">
                <Clock className="h-3 w-3 text-[var(--text-muted)]" /> {turnoLabel(emp.turno)}
              </span>
            )}
            {(emp.horaEntrada || emp.horaSaida) && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[0.75rem] font-medium text-[var(--text-secondary)]">
                <Clock className="h-3 w-3 text-[var(--text-muted)]" /> {emp.horaEntrada || '—'}–{emp.horaSaida || '—'}
              </span>
            )}
            {(emp.diasTrabalho?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-2.5 py-1 text-[0.75rem] font-medium text-[var(--text-secondary)]">
                <CalendarDays className="h-3 w-3 text-[var(--text-muted)]" /> {diasResumo(emp.diasTrabalho)}
              </span>
            )}
            {emp.recebeNotificacoes !== undefined && (
              emp.recebeNotificacoes ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#cdebd9] bg-[#ecf7f0] px-2.5 py-1 text-[0.75rem] font-semibold text-[#1e7e4e]">
                  <Bell className="h-3 w-3" /> Notificações ativadas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)] px-2.5 py-1 text-[0.75rem] font-semibold text-[var(--text-muted)]">
                  <BellOff className="h-3 w-3" /> Notificações desativadas
                </span>
              )
            )}
          </div>
        </div>
      )}
    </ModalShell>
  )
}

// ── Linha da tabela (desktop) ────────────────────────────────────────────────
function RowActions({ row, onCopy, copied }: { row: EmployeeRow; onCopy: (link: string, id: string) => void; copied: string | null }) {
  const link = acessoLink(row.employee.id)
  const isCopied = copied === row.employee.id
  return (
    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <button onClick={(e) => { e.stopPropagation(); onCopy(link, row.employee.id) }} title="Copiar link"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--ink)]">
        {isCopied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
      </button>
      <a href={waLink(row.employee.name, link)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} title="Enviar no WhatsApp"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1e7e4e] hover:bg-[#ecf7f0]">
        <MessageCircle className="h-4 w-4" />
      </a>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] group-hover:bg-[var(--bg-muted)] group-hover:text-[var(--ink)]">
        <Pencil className="h-4 w-4" />
      </span>
    </div>
  )
}

function ColabRow({ row, dono, gerenteName, onEdit, onCopy, copied }: {
  row: EmployeeRow; dono: boolean; gerenteName?: string
  onEdit: (r: EmployeeRow) => void; onCopy: (link: string, id: string) => void; copied: string | null
}) {
  const pct = Math.round(row.progress * 100)
  const quizPct = quizPctOf(row)
  return (
    <tr className="group cursor-pointer" tabIndex={0} aria-label={`Editar ${row.employee.name}`}
      onClick={() => onEdit(row)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(row) } }}>
      <td>
        <div className="flex items-center gap-3">
          <Avatar name={row.employee.name} src={row.employee.avatarUrl} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-[var(--ink)]">{row.employee.name}</p>
            <p className="font-mono text-[0.7rem] text-[var(--text-muted)]">{row.employee.access_code ?? '—'}</p>
          </div>
        </div>
      </td>
      <td><span className="adm-badge adm-badge--muted">{row.employee.role}</span></td>
      {dono && <td className="text-[var(--text-secondary)]">{gerenteName ?? '—'}</td>}
      <td>
        <div className="flex items-center gap-2">
          <div className="adm-pbar w-24"><i style={{ width: `${pct}%` }} /></div>
          <span className="w-10 text-right text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
        </div>
      </td>
      <td className="text-xs text-[var(--text-secondary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{quizPct != null ? `${quizPct}%` : '—'}</td>
      <td><StatusBadge status={statusOf(row)} /></td>
      <td onClick={(e) => e.stopPropagation()}><RowActions row={row} onCopy={onCopy} copied={copied} /></td>
    </tr>
  )
}

// ── Card (mobile) ────────────────────────────────────────────────────────────
function ColabCardMobile({ row, onEdit, onCopy, copied }: {
  row: EmployeeRow; onEdit: (r: EmployeeRow) => void; onCopy: (link: string, id: string) => void; copied: string | null
}) {
  const pct = Math.round(row.progress * 100)
  const link = acessoLink(row.employee.id)
  const isCopied = copied === row.employee.id
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-4" onClick={() => onEdit(row)}>
      <div className="flex items-start gap-3">
        <Avatar name={row.employee.name} size={40} src={row.employee.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--ink)]">{row.employee.name}</p>
          <span className="adm-badge adm-badge--muted mt-1">{row.employee.role}</span>
        </div>
        <StatusBadge status={statusOf(row)} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="adm-pbar flex-1"><i style={{ width: `${pct}%` }} /></div>
        <span className="text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.completedModules}/{row.totalModules}</span>
      </div>
      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onCopy(link, row.employee.id)} className="adm-btn flex-1 h-9">
          {isCopied ? <><Check className="h-4 w-4 text-[var(--success)]" /> Copiado</> : <><Copy className="h-4 w-4" /> Copiar link</>}
        </button>
        <a href={waLink(row.employee.name, link)} target="_blank" rel="noreferrer" className="adm-btn h-9 no-underline border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  )
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function AdminColaboradores() {
  const session = getAdminSession()
  const dono = isDono()
  const gerentes = useMemo(() => listGerentes(), [])
  const gerenteName = useMemo(() => {
    const map: Record<string, string> = {}
    for (const g of gerentes) map[g.id] = g.nome
    return map
  }, [gerentes])

  const [rows, setRows] = useState<EmployeeRow[] | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [cargosOpen, setCargosOpen] = useState(false)
  const [success, setSuccess] = useState<{ name: string; role: string; link: string } | null>(null)
  const [editing, setEditing] = useState<EmployeeRow | null>(null)
  const [viewing, setViewing] = useState<EmployeeRow | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')

  const reload = () =>
    loadEmployeeRows().then((all) => setRows(dono ? all : all.filter((r) => r.employee.gerenteId === session?.id)))
  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copy = async (link: string, id: string) => {
    try { await navigator.clipboard.writeText(link) } catch { /* noop */ }
    setCopied(id); setTimeout(() => setCopied(null), 1800)
  }

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.toLowerCase().trim()
    return q ? rows.filter((r) => r.employee.name.toLowerCase().includes(q) || r.employee.role.toLowerCase().includes(q)) : rows
  }, [rows, search])

  const hasPeople = rows !== null && rows.length > 0

  return (
    <>
      <AdminPageHeader
        eyebrow="Pessoas"
        title="Colaboradores"
        description="Cadastre, acompanhe e envie o link de treinamento para cada colaborador."
        action={
          <div className="flex items-center gap-2">
            <button className="adm-btn" onClick={() => setCargosOpen(true)}>
              <Briefcase className="h-[18px] w-[18px]" /> Cargos
            </button>
            <button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}>
              <Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Novo colaborador
            </button>
          </div>
        }
      />

      {/* busca */}
      {hasPeople && (
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou cargo…"
              className="adm-input" style={{ paddingLeft: 38, paddingRight: 34 }} />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Limpar busca"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-muted)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* conteúdo */}
      {rows === null ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState
            icon={UserPlus}
            title="Nenhum colaborador cadastrado"
            hint="Cadastre o primeiro colaborador e compartilhe o link de treinamento via WhatsApp."
            action={<button className="adm-btn adm-btn--primary" onClick={() => setOpenForm(true)}><Plus className="h-[18px] w-[18px]" strokeWidth={2} /> Cadastrar o primeiro</button>}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState icon={Search} title={`Nenhum resultado para “${search}”`} hint="Tente outro nome ou cargo." compact />
        </div>
      ) : (
        <>
          {/* desktop: tabela */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--border)] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Cargo</th>
                    {dono && <th>Gerente</th>}
                    <th className="w-[22%]">Progresso</th>
                    <th>Quiz</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <ColabRow key={row.employee.id} row={row} dono={dono} onEdit={setViewing} onCopy={copy} copied={copied}
                      gerenteName={row.employee.gerenteId ? gerenteName[row.employee.gerenteId] : undefined} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* mobile: cards */}
          <motion.div initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-col gap-3 md:hidden">
            {filtered.map((row) => (
              <motion.div key={row.employee.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <ColabCardMobile row={row} onEdit={setViewing} onCopy={copy} copied={copied} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* modais */}
      <AnimatePresence>
        {cargosOpen && <CargosManager onClose={() => setCargosOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {openForm && (
          <NovoColaboradorModal onClose={() => setOpenForm(false)} onSaved={(emp) => { setOpenForm(false); setSuccess(emp); reload() }}
            gerentes={gerentes} defaultGerenteId={dono ? '' : (session?.id ?? '')} lockGerente={!dono} />
        )}
      </AnimatePresence>
      <AnimatePresence>{success && <SuccessModal {...success} onClose={() => setSuccess(null)} />}</AnimatePresence>
      <AnimatePresence>
        {viewing && (
          <ColaboradorDetailModal row={viewing} onClose={() => setViewing(null)}
            gerenteName={viewing.employee.gerenteId ? gerenteName[viewing.employee.gerenteId] : undefined}
            onEdit={(r) => { setViewing(null); setEditing(r) }} onCopy={copy} copied={copied} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editing && (
          <EditColaboradorModal row={editing} onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload() }} onDeleted={() => { setEditing(null); reload() }}
            gerentes={gerentes} lockGerente={!dono} />
        )}
      </AnimatePresence>
    </>
  )
}
