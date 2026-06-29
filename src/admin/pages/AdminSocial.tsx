import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, Pin, PinOff, Pencil, Send, Archive, Trash2, ImagePlus, X, Eye, CheckCheck } from 'lucide-react'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, ModalShell, ModalHeader } from '../components/ui'
import { getAdminSession } from '../auth'
import { listEmployees } from '@/lib/storage'
import { ROLES, type Employee, type Role, type SocialPost, type SocialPostType } from '@/lib/types'
import {
  getAllPosts, savePost, setPostStatus, togglePin, deletePost, useSocialVersion, engagementForPost,
} from '@/lib/social'
import { SAFE_CARD_COLORS, readableTextOn } from '@/lib/socialPresets'
import { fileToDownscaledDataURL, ALLOWED_LABEL } from '@/lib/image'

const TYPE_OPTIONS: { value: SocialPostType; label: string; color: string }[] = [
  { value: 'aviso', label: 'Aviso', color: '#b7791f' },
  { value: 'gratidao', label: 'Gratidao', color: '#1e7e4e' },
  { value: 'aniversariante', label: 'Aniversario', color: '#8e44ad' },
  { value: 'importante', label: 'Importante', color: '#c0392b' },
  { value: 'treinamento', label: 'Treinamento', color: '#c9501a' },
  { value: 'motivacao', label: 'Motivacao', color: '#2f74a8' },
  { value: 'geral', label: 'Geral', color: '#8a837c' },
]
const typeMeta = (t: SocialPostType) => TYPE_OPTIONS.find((o) => o.value === t) ?? TYPE_OPTIONS[5]

type AudienceKind = 'all' | 'store' | 'role' | 'employee'

interface FormState {
  id?: string
  title: string
  message: string
  type: SocialPostType
  audienceKind: AudienceKind
  store: string
  role: Role
  employeeId: string
  pinned: boolean
  image?: string
  cardColor?: string
  textColor?: string
}
const EMPTY_FORM: FormState = {
  title: '', message: '', type: 'geral', audienceKind: 'all',
  store: '', role: ROLES[0], employeeId: '', pinned: false,
}

const STATUS_META: Record<SocialPost['status'], { label: string; cls: string }> = {
  draft: { label: 'Rascunho', cls: 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border)]' },
  published: { label: 'Publicado', cls: 'bg-[#ecf7f0] text-[#1e7e4e] border-[#cdebd9]' },
  archived: { label: 'Arquivado', cls: 'bg-[#fdf4e3] text-[#9a6b15] border-[#f5e2c0]' },
}

export default function AdminSocial() {
  const version = useSocialVersion()
  const session = getAdminSession()
  const posts = useMemo(() => getAllPosts(), [version])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [modal, setModal] = useState<FormState | null>(null)
  const [imgErr, setImgErr] = useState('')
  const [imgBusy, setImgBusy] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void listEmployees().then(setEmployees)
  }, [])

  const handleImage = async (file: File | undefined) => {
    if (!file) return
    setImgErr(''); setImgBusy(true)
    try {
      const res = await fileToDownscaledDataURL(file)
      setModal((m) => (m ? { ...m, image: res.dataUrl } : m))
    } catch (e) {
      setImgErr(e instanceof Error ? e.message : 'Falha ao processar a imagem.')
    } finally {
      setImgBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const audienceLabel = (p: SocialPost): string => {
    const a = p.audience
    switch (a.kind) {
      case 'all': return 'Todos'
      case 'store': return `Loja: ${a.value}`
      case 'role': return `Cargo: ${a.value}`
      case 'employee':
        return `Colaborador: ${employees.find((e) => e.id === a.value)?.name ?? a.value}`
    }
  }

  const openNew = () => { setImgErr(''); setModal({ ...EMPTY_FORM }) }
  const openEdit = (p: SocialPost) => {
    setImgErr('')
    setModal({
      id: p.id, title: p.title, message: p.message, type: p.type, pinned: p.pinned,
      audienceKind: p.audience.kind,
      store: p.audience.kind === 'store' ? p.audience.value : '',
      role: p.audience.kind === 'role' ? p.audience.value : ROLES[0],
      employeeId: p.audience.kind === 'employee' ? p.audience.value : '',
      image: p.image, cardColor: p.cardColor, textColor: p.textColor,
    })
  }

  const save = (status: 'draft' | 'published') => {
    if (!modal || !session) return
    const f = modal
    if (!f.title.trim() || !f.message.trim()) return
    if (f.audienceKind === 'store' && !f.store.trim()) return
    if (f.audienceKind === 'employee' && !f.employeeId) return
    const audience =
      f.audienceKind === 'store' ? { kind: 'store' as const, value: f.store.trim() }
      : f.audienceKind === 'role' ? { kind: 'role' as const, value: f.role }
      : f.audienceKind === 'employee' ? { kind: 'employee' as const, value: f.employeeId }
      : { kind: 'all' as const }
    savePost({
      id: f.id, title: f.title.trim(), message: f.message.trim(), type: f.type,
      audience, pinned: f.pinned, status,
      created_by: session.id, created_by_name: session.nome,
      created_by_role: session.role,
      image: f.image, cardColor: f.cardColor, textColor: f.textColor,
    })
    setModal(null)
  }

  const remove = (p: SocialPost) => {
    if (window.confirm(`Excluir o comunicado "${p.title}"? Esta acao nao pode ser desfeita.`)) {
      deletePost(p.id)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <AdminPageHeader
        eyebrow="Comunicacao"
        title="Social"
        description="Comunicados, avisos e mensagens internas para a equipe. Publique para todos ou direcione por loja, cargo ou colaborador."
        action={
          <button onClick={openNew} className="adm-btn adm-btn--primary">
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.1} /> Novo comunicado
          </button>
        }
      />

      {posts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState
            icon={Megaphone}
            title="Nenhum comunicado ainda"
            hint="Crie o primeiro comunicado para aparecer no Social do colaborador."
            action={<button onClick={openNew} className="adm-btn adm-btn--primary"><Plus className="h-[18px] w-[18px]" /> Novo comunicado</button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => {
            const tm = typeMeta(p.type)
            const sm = STATUS_META[p.status]
            const eng = engagementForPost(p.id)
            const open = reportId === p.id
            return (
              <div key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.04em]"
                    style={{ color: tm.color, background: `${tm.color}1a`, border: `1px solid ${tm.color}40` }}>
                    {tm.label}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${sm.cls}`}>{sm.label}</span>
                  {p.pinned && <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--accent-text)]"><Pin className="h-3.5 w-3.5" /> Fixado</span>}
                  <span className="ml-auto text-[0.75rem] text-[var(--text-muted)]">{audienceLabel(p)}</span>
                </div>

                <h3 className="mt-3 text-[0.95rem] font-semibold text-[var(--ink)]">{p.title}</h3>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{p.message}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
                  <span className="text-[0.72rem] text-[var(--text-muted)]">
                    {p.created_by_name ?? 'Pralis'} {p.published_at ? `· publicado ${new Date(p.published_at).toLocaleDateString('pt-BR')}` : '· rascunho'}
                  </span>
                  <span className="flex items-center gap-3 text-[0.72rem] text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {eng.views.length}</span>
                    <span className="inline-flex items-center gap-1"><CheckCheck className="h-3.5 w-3.5" /> {eng.confirms.length}</span>
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    <ActionBtn icon={Eye} label={open ? 'Fechar' : 'Leituras'} onClick={() => setReportId(open ? null : p.id)} />
                    <ActionBtn icon={Pencil} label="Editar" onClick={() => openEdit(p)} />
                    {p.status !== 'published'
                      ? <ActionBtn icon={Send} label="Publicar" onClick={() => setPostStatus(p.id, 'published')} primary />
                      : <ActionBtn icon={Archive} label="Arquivar" onClick={() => setPostStatus(p.id, 'archived')} />}
                    <ActionBtn icon={p.pinned ? PinOff : Pin} label={p.pinned ? 'Desafixar' : 'Fixar'} onClick={() => togglePin(p.id)} />
                    <ActionBtn icon={Trash2} label="Excluir" onClick={() => remove(p)} danger />
                  </div>
                </div>

                {open && (
                  <div className="mt-3 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Confirmaram ({eng.confirms.length})
                      </p>
                      {eng.confirms.length === 0 ? (
                        <p className="text-[0.78rem] text-[var(--text-muted)]">Ninguem confirmou ainda.</p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {eng.confirms.map((r) => (
                            <li key={r.employee_id} className="flex items-center justify-between gap-2 text-[0.8rem]">
                              <span className="font-medium text-[var(--ink)]">{r.employee_name}</span>
                              <span className="text-[var(--text-muted)]">{r.confirmed_at ? new Date(r.confirmed_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Visualizaram ({eng.views.length})
                      </p>
                      {eng.views.length === 0 ? (
                        <p className="text-[0.78rem] text-[var(--text-muted)]">Nenhuma visualizacao ainda.</p>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {eng.views.map((r) => (
                            <li key={r.employee_id} className="flex items-center justify-between gap-2 text-[0.8rem]">
                              <span className="font-medium text-[var(--ink)]">{r.employee_name}</span>
                              <span className="text-[var(--text-muted)]">{r.viewed_at ? new Date(r.viewed_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <ModalShell onClose={() => setModal(null)}>
            <ModalHeader icon={Megaphone} eyebrow={modal.id ? 'Editar' : 'Novo'} title="Comunicado" onClose={() => setModal(null)} />

            <label className="adm-label" htmlFor="sp-title">Titulo</label>
            <input id="sp-title" className="adm-input mb-3" value={modal.title}
              onChange={(e) => setModal({ ...modal, title: e.target.value })} placeholder="Ex.: Reuniao de seguranca na sexta" />

            <label className="adm-label" htmlFor="sp-msg">Mensagem</label>
            <textarea id="sp-msg" className="adm-input mb-3" rows={4} value={modal.message}
              onChange={(e) => setModal({ ...modal, message: e.target.value })} placeholder="Escreva o comunicado..." />

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label" htmlFor="sp-type">Tipo</label>
                <select id="sp-type" className="adm-input" value={modal.type}
                  onChange={(e) => setModal({ ...modal, type: e.target.value as SocialPostType })}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="adm-label" htmlFor="sp-aud">Publico</label>
                <select id="sp-aud" className="adm-input" value={modal.audienceKind}
                  onChange={(e) => setModal({ ...modal, audienceKind: e.target.value as AudienceKind })}>
                  <option value="all">Todos</option>
                  <option value="store">Loja especifica</option>
                  <option value="role">Cargo especifico</option>
                  <option value="employee">Colaborador especifico</option>
                </select>
              </div>
            </div>

            {modal.audienceKind === 'store' && (
              <div className="mb-3">
                <label className="adm-label" htmlFor="sp-store">Loja</label>
                <input id="sp-store" className="adm-input" value={modal.store}
                  onChange={(e) => setModal({ ...modal, store: e.target.value })} placeholder="Ex.: Vila Nova" />
              </div>
            )}
            {modal.audienceKind === 'role' && (
              <div className="mb-3">
                <label className="adm-label" htmlFor="sp-role">Cargo</label>
                <select id="sp-role" className="adm-input" value={modal.role}
                  onChange={(e) => setModal({ ...modal, role: e.target.value as Role })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            {modal.audienceKind === 'employee' && (
              <div className="mb-3">
                <label className="adm-label" htmlFor="sp-emp">Colaborador</label>
                <select id="sp-emp" className="adm-input" value={modal.employeeId}
                  onChange={(e) => setModal({ ...modal, employeeId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}

            {/* Aparencia do card (preset ou cor segura; texto auto-legivel) */}
            <div className="mb-4">
              <span className="adm-label">Aparencia do card</span>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setModal({ ...modal, cardColor: undefined, textColor: undefined })}
                  className={`h-8 rounded-lg border px-2.5 text-[0.72rem] font-semibold transition-colors ${!modal.cardColor ? 'border-[var(--accent)] text-[var(--accent-text)]' : 'border-[var(--border-strong)] text-[var(--text-secondary)]'}`}>
                  Preset do tipo
                </button>
                {SAFE_CARD_COLORS.map((c) => (
                  <button key={c} type="button" aria-label={`Cor ${c}`}
                    onClick={() => setModal({ ...modal, cardColor: c, textColor: readableTextOn(c) })}
                    className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-105 ${modal.cardColor === c ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <p className="mt-1.5 text-[0.72rem] text-[var(--text-muted)]">
                Texto ajustado automaticamente para legibilidade (contraste AA).
              </p>
            </div>

            {/* Imagem opcional */}
            <div className="mb-4">
              <span className="adm-label">Imagem (opcional)</span>
              {modal.image ? (
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)]" style={{ background: '#14140f' }}>
                  <img src={modal.image} alt="Pre-visualizacao" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', display: 'block' }} />
                  <button type="button" onClick={() => setModal({ ...modal, image: undefined })}
                    aria-label="Remover imagem"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white transition-colors hover:bg-black/75">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={imgBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-strong)] px-4 py-5 text-[0.85rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-60">
                  <ImagePlus className="h-[18px] w-[18px]" /> {imgBusy ? 'Processando...' : 'Adicionar imagem'}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => handleImage(e.target.files?.[0])} />
              <p className="mt-1.5 text-[0.72rem] text-[var(--text-muted)]">
                {ALLOWED_LABEL} - redimensionada automaticamente. Em producao: Supabase Storage/CDN.
              </p>
              {imgErr && <p className="mt-1 text-[0.75rem] font-medium text-[var(--danger)]">{imgErr}</p>}
            </div>

            <label className="mb-5 mt-1 flex cursor-pointer items-center gap-2.5 text-[0.85rem] text-[var(--ink)]">
              <input type="checkbox" checked={modal.pinned} onChange={(e) => setModal({ ...modal, pinned: e.target.checked })} />
              Fixar no topo do feed
            </label>

            <div className="flex gap-2.5">
              <button onClick={() => save('draft')} className="flex-1 rounded-lg border border-[var(--border-strong)] px-4 py-2.5 text-[0.875rem] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--bg-subtle)]">
                Salvar rascunho
              </button>
              <button onClick={() => save('published')} className="adm-btn adm-btn--primary flex-1 justify-center">
                <Send className="h-[18px] w-[18px]" /> Publicar
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, onClick, primary, danger }: {
  icon: typeof Pin; label: string; onClick: () => void; primary?: boolean; danger?: boolean
}) {
  const cls = primary
    ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent-text)] hover:bg-[#fde6d8]'
    : danger
    ? 'border-[var(--border)] text-[var(--danger)] hover:bg-[var(--danger-bg)]'
    : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${cls}`}>
      <Icon className="h-[15px] w-[15px]" strokeWidth={2} /> {label}
    </button>
  )
}
