import { useEffect, useMemo, useState } from 'react'
import { Inbox, Send, Archive, Check, CheckCheck, Mail, Reply, CornerDownRight, Users, User } from 'lucide-react'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, Avatar } from '../components/ui'
import { getAdminSession, listGerentes } from '../auth'
import type { AdminMessage } from '@/lib/types'
import {
  sendMessage, inboxForAdmin, inboxForGerente, sentBy, markMessageRead, archiveMessage,
  replyMessage, resolveMessage, useInboxVersion,
} from '@/lib/inbox'

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

/** Pílula de status da mensagem. */
function StatusPill({ m }: { m: AdminMessage }) {
  if (m.resolved) return <span className="rounded-full border border-[#cdebd9] bg-[#ecf7f0] px-2.5 py-1 text-[0.7rem] font-semibold text-[#1e7e4e]">Concluída</span>
  if (m.replies?.length) return <span className="rounded-full border border-[#f6d9c8] bg-[var(--accent-tint)] px-2.5 py-1 text-[0.7rem] font-semibold text-[var(--accent-text)]">Respondida</span>
  if (m.read) return <span className="rounded-full border border-[var(--border)] bg-[var(--bg-muted)] px-2.5 py-1 text-[0.7rem] font-semibold text-[var(--text-muted)]">Lida</span>
  return <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.04em] text-white">Nova</span>
}

/** Thread de respostas (compartilhado). */
function Replies({ m }: { m: AdminMessage }) {
  if (!m.replies?.length) return null
  return (
    <div className="mt-3 flex flex-col gap-2 border-l-2 border-[var(--border)] pl-3">
      {m.replies.map((r, i) => (
        <div key={i}>
          <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-[var(--ink)]">
            <CornerDownRight className="h-3 w-3 text-[var(--text-muted)]" />
            {r.from_name} <span className="font-normal text-[var(--text-muted)]">· {r.from_role === 'dono' ? 'Admin' : 'Gerente'} · {fmt(r.created_at)}</span>
          </p>
          <p className="mt-0.5 whitespace-pre-wrap pl-4 text-[0.82rem] text-[var(--text-secondary)]">{r.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminInbox() {
  const session = getAdminSession()
  const isDono = session?.role === 'dono'
  const version = useInboxVersion()
  const gerentes = useMemo(() => listGerentes(), [])

  // composição
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('') // dono: gerenteId | '__all__'
  const [sentOk, setSentOk] = useState(false)
  // rascunhos de resposta por mensagem
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})

  const setDraft = (id: string, v: string) => setReplyDraft((d) => ({ ...d, [id]: v }))

  // ── GERENTE: recebe do admin + compõe p/ admin + enviadas ───────────────────
  const received = useMemo(() => (isDono ? inboxForAdmin() : (session ? inboxForGerente(session.id) : [])), [version, isDono, session])
  const sent = useMemo(() => (session ? sentBy(session.id) : []), [version, session])

  // gerente: marca recebidas como lidas ao abrir
  useEffect(() => {
    if (!isDono && session) received.forEach((m) => { if (!m.read) markMessageRead(m.id) })
  }, [isDono, session, received])

  const sendToAdmin = () => {
    if (!session || !title.trim() || !message.trim()) return
    sendMessage({ from_id: session.id, from_name: session.nome, from_role: 'gerente', title, message })
    setTitle(''); setMessage(''); setSentOk(true)
  }
  const sendFromAdmin = () => {
    if (!session || !title.trim() || !message.trim() || !target) return
    sendMessage({
      from_id: session.id, from_name: session.nome, from_role: 'dono', title, message,
      to_id: target === '__all__' ? undefined : target,
      to_all_gerentes: target === '__all__' ? true : undefined,
    })
    setTitle(''); setMessage(''); setTarget(''); setSentOk(true)
  }
  const sendReply = (id: string) => {
    if (!session) return
    const text = (replyDraft[id] ?? '').trim()
    if (!text) return
    replyMessage(id, { from_id: session.id, from_name: session.nome, from_role: isDono ? 'dono' : 'gerente', text })
    setDraft(id, '')
  }

  // ════════════════════ GERENTE ════════════════════
  if (!isDono) {
    return (
      <div className="mx-auto w-full max-w-[760px]">
        <AdminPageHeader eyebrow="Comunicacao" title="Mensagens" description="Recados com o Admin. Não vão para os colaboradores." />

        {/* recebidas do admin */}
        <h2 className="mb-3 text-[0.95rem] font-semibold text-[var(--ink)]">Do Admin</h2>
        {received.length === 0 ? (
          <div className="adm-card mb-7"><EmptyState icon={Inbox} title="Nenhuma mensagem do Admin" hint="Recados do Admin para você aparecem aqui." compact /></div>
        ) : (
          <div className="mb-7 flex flex-col gap-2.5">
            {received.map((m) => (
              <div key={m.id} className="adm-card p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={m.from_name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{m.title}</span>
                      {m.to_all_gerentes && <span className="adm-badge adm-badge--muted"><Users className="h-3 w-3" /> Todos os gerentes</span>}
                    </div>
                    <p className="text-[0.74rem] text-[var(--text-muted)]">Admin · {fmt(m.created_at)}</p>
                    <p className="mt-2 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{m.message}</p>
                    <Replies m={m} />
                    {/* gerente pode responder ao admin */}
                    <div className="mt-3 flex items-end gap-2">
                      <textarea rows={1} className="adm-input flex-1" placeholder="Responder ao Admin…"
                        value={replyDraft[m.id] ?? ''} onChange={(e) => setDraft(m.id, e.target.value)} />
                      <button onClick={() => sendReply(m.id)} disabled={!(replyDraft[m.id] ?? '').trim()}
                        className="adm-btn adm-btn--primary h-9 shrink-0 disabled:opacity-50"><Reply className="h-4 w-4" /> Responder</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* compor para o admin */}
        <h2 className="mb-3 text-[0.95rem] font-semibold text-[var(--ink)]">Enviar ao Admin</h2>
        <div className="adm-card p-5">
          <label className="adm-label" htmlFor="im-title">Assunto</label>
          <input id="im-title" className="adm-input mb-3" value={title}
            onChange={(e) => { setTitle(e.target.value); setSentOk(false) }} placeholder="Ex.: Falta de farinha na loja" />
          <label className="adm-label" htmlFor="im-msg">Mensagem</label>
          <textarea id="im-msg" className="adm-input mb-4" rows={4} value={message}
            onChange={(e) => { setMessage(e.target.value); setSentOk(false) }} placeholder="Escreva para o Admin..." />
          <div className="flex items-center gap-3">
            <button onClick={sendToAdmin} disabled={!title.trim() || !message.trim()} className="adm-btn adm-btn--primary disabled:opacity-50">
              <Send className="h-[18px] w-[18px]" /> Enviar ao Admin
            </button>
            {sentOk && <span className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--success)]"><Check className="h-4 w-4" /> Mensagem enviada</span>}
          </div>
        </div>

        <h2 className="mb-3 mt-7 text-[0.95rem] font-semibold text-[var(--ink)]">Enviadas</h2>
        {sent.length === 0 ? (
          <div className="adm-card"><EmptyState icon={Mail} title="Nenhuma mensagem enviada" hint="Suas mensagens ao Admin aparecem aqui com o status." compact /></div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sent.map((m) => (
              <div key={m.id} className="adm-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{m.title}</span>
                  <StatusPill m={m} />
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{m.message}</p>
                <Replies m={m} />
                <p className="mt-2 text-[0.72rem] text-[var(--text-muted)]">{fmt(m.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ════════════════════ DONO ════════════════════
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <AdminPageHeader eyebrow="Comunicacao" title="Mensagens" description="Recados dos gerentes e mensagens diretas para a equipe de gestão." />

      {/* compor para gerente / todos */}
      <h2 className="mb-3 text-[0.95rem] font-semibold text-[var(--ink)]">Enviar a um gerente</h2>
      <div className="adm-card mb-7 p-5">
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_2fr]">
          <div>
            <label className="adm-label" htmlFor="dm-to">Para</label>
            <select id="dm-to" className="adm-input" value={target} onChange={(e) => { setTarget(e.target.value); setSentOk(false) }}>
              <option value="">Selecione…</option>
              <option value="__all__">Todos os gerentes</option>
              {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="adm-label" htmlFor="dm-title">Assunto</label>
            <input id="dm-title" className="adm-input" value={title}
              onChange={(e) => { setTitle(e.target.value); setSentOk(false) }} placeholder="Ex.: Meta da semana" />
          </div>
        </div>
        <label className="adm-label" htmlFor="dm-msg">Mensagem</label>
        <textarea id="dm-msg" className="adm-input mb-4" rows={3} value={message}
          onChange={(e) => { setMessage(e.target.value); setSentOk(false) }} placeholder="Escreva para o gerente…" />
        <div className="flex items-center gap-3">
          <button onClick={sendFromAdmin} disabled={!title.trim() || !message.trim() || !target} className="adm-btn adm-btn--primary disabled:opacity-50">
            <Send className="h-[18px] w-[18px]" /> Enviar
          </button>
          <span className="flex items-center gap-1.5 text-[0.74rem] text-[var(--text-muted)]">
            {target === '__all__' ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            Aparece no painel do gerente, não para os colaboradores.
          </span>
          {sentOk && <span className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--success)]"><Check className="h-4 w-4" /> Enviada</span>}
        </div>
      </div>

      {/* caixa de entrada (dos gerentes) */}
      <h2 className="mb-3 text-[0.95rem] font-semibold text-[var(--ink)]">Recebidas dos gerentes</h2>
      {received.length === 0 ? (
        <div className="adm-card"><EmptyState icon={Inbox} title="Caixa de entrada vazia" hint="Mensagens dos gerentes aparecem aqui." /></div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {received.map((m) => (
            <div key={m.id} className={`adm-card p-4 ${m.read || m.resolved ? '' : 'border-[var(--accent)]'}`}>
              <div className="flex items-start gap-3">
                <Avatar name={m.from_name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{m.title}</span>
                    <StatusPill m={m} />
                  </div>
                  <p className="text-[0.74rem] text-[var(--text-muted)]">{m.from_name} · {fmt(m.created_at)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{m.message}</p>
                  <Replies m={m} />

                  {/* responder */}
                  <div className="mt-3 flex items-end gap-2">
                    <textarea rows={1} className="adm-input flex-1" placeholder="Responder ao gerente…"
                      value={replyDraft[m.id] ?? ''} onChange={(e) => setDraft(m.id, e.target.value)} />
                    <button onClick={() => sendReply(m.id)} disabled={!(replyDraft[m.id] ?? '').trim()}
                      className="adm-btn adm-btn--primary h-9 shrink-0 disabled:opacity-50"><Reply className="h-4 w-4" /> Responder</button>
                  </div>

                  {/* ações */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {!m.resolved ? (
                      <button onClick={() => resolveMessage(m.id, true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#cdebd9] bg-[#ecf7f0] px-2.5 py-1.5 text-[0.78rem] font-semibold text-[#1e7e4e] transition-colors hover:bg-[#e2f3e9]">
                        <CheckCheck className="h-[15px] w-[15px]" /> Concluir
                      </button>
                    ) : (
                      <button onClick={() => resolveMessage(m.id, false)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[0.78rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
                        Reabrir
                      </button>
                    )}
                    {!m.read && (
                      <button onClick={() => markMessageRead(m.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[0.78rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
                        <Check className="h-[15px] w-[15px]" /> Marcar como lida
                      </button>
                    )}
                    <button onClick={() => archiveMessage(m.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[0.78rem] font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]">
                      <Archive className="h-[15px] w-[15px]" /> Arquivar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
