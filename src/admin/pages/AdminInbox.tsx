import { useMemo, useState } from 'react'
import { Inbox, Send, Archive, Check, Mail } from 'lucide-react'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EmptyState, Avatar } from '../components/ui'
import { getAdminSession } from '../auth'
import {
  sendMessage, inboxForAdmin, sentBy, markMessageRead, archiveMessage, useInboxVersion,
} from '@/lib/inbox'

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function AdminInbox() {
  const session = getAdminSession()
  const isDono = session?.role === 'dono'
  const version = useInboxVersion()

  const received = useMemo(() => inboxForAdmin(), [version])
  const sent = useMemo(() => (session ? sentBy(session.id) : []), [version, session])

  // compose (gerente)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sentOk, setSentOk] = useState(false)

  const send = () => {
    if (!session || !title.trim() || !message.trim()) return
    sendMessage({ from_id: session.id, from_name: session.nome, title, message })
    setTitle(''); setMessage(''); setSentOk(true)
  }

  // ---------------- GERENTE: compor + enviadas ----------------
  if (!isDono) {
    return (
      <div className="mx-auto w-full max-w-[760px]">
        <AdminPageHeader eyebrow="Comunicacao" title="Mensagens" description="Envie um recado ou lembrete direto para o Admin. Nao vai para os colaboradores." />

        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <label className="adm-label" htmlFor="im-title">Assunto</label>
          <input id="im-title" className="adm-input mb-3" value={title}
            onChange={(e) => { setTitle(e.target.value); setSentOk(false) }} placeholder="Ex.: Falta de farinha na loja" />
          <label className="adm-label" htmlFor="im-msg">Mensagem</label>
          <textarea id="im-msg" className="adm-input mb-4" rows={4} value={message}
            onChange={(e) => { setMessage(e.target.value); setSentOk(false) }} placeholder="Escreva para o Admin..." />
          <div className="flex items-center gap-3">
            <button onClick={send} disabled={!title.trim() || !message.trim()} className="adm-btn adm-btn--primary disabled:opacity-50">
              <Send className="h-[18px] w-[18px]" /> Enviar ao Admin
            </button>
            {sentOk && <span className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-[var(--success)]"><Check className="h-4 w-4" /> Mensagem enviada</span>}
          </div>
        </div>

        <h2 className="mb-3 mt-7 text-[0.95rem] font-semibold text-[var(--ink)]">Enviadas</h2>
        {sent.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-white">
            <EmptyState icon={Mail} title="Nenhuma mensagem enviada" hint="Suas mensagens ao Admin aparecem aqui com o status." compact />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sent.map((m) => (
              <div key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{m.title}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${m.read ? 'border-[#cdebd9] bg-[#ecf7f0] text-[#1e7e4e]' : 'border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}>
                    {m.read ? 'Lido' : 'Enviado'}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{m.message}</p>
                <p className="mt-2 text-[0.72rem] text-[var(--text-muted)]">{fmt(m.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------------- DONO: caixa de entrada ----------------
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <AdminPageHeader eyebrow="Comunicacao" title="Mensagens" description="Recados e lembretes enviados pelos gerentes." />

      {received.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-white">
          <EmptyState icon={Inbox} title="Caixa de entrada vazia" hint="Mensagens dos gerentes aparecem aqui." />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {received.map((m) => (
            <div key={m.id} className={`rounded-xl border bg-white p-4 ${m.read ? 'border-[var(--border)]' : 'border-[var(--accent)]'}`}>
              <div className="flex items-start gap-3">
                <Avatar name={m.from_name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.92rem] font-semibold text-[var(--ink)]">{m.title}</span>
                    {!m.read && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-white">Novo</span>}
                  </div>
                  <p className="text-[0.74rem] text-[var(--text-muted)]">{m.from_name} · {fmt(m.created_at)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-[0.85rem] text-[var(--text-secondary)]">{m.message}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
