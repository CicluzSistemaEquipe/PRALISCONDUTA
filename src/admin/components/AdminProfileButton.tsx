import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Camera, Trash2 } from 'lucide-react'
import { ModalShell, ModalHeader, Avatar } from './ui'
import { setAdminAvatar } from '../auth'
import { fileToDownscaledDataURL, ALLOWED_LABEL } from '@/lib/image'
import type { AdminUser } from '@/lib/types'

/** Bloco de usuario do admin (sidebar) — clicavel para trocar a foto de perfil. */
export function AdminProfileButton({ session, roleLabel }: { session: AdminUser; roleLabel: string }) {
  const [open, setOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | undefined>(session.avatarUrl)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    setErr(''); setBusy(true)
    try {
      const res = await fileToDownscaledDataURL(file)
      setAdminAvatar(res.dataUrl)
      setAvatar(res.dataUrl)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao processar a imagem.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  const remove = () => { setAdminAvatar(null); setAvatar(undefined) }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--bg-muted)]"
      >
        <Avatar name={session.nome} src={avatar} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8rem] font-semibold text-[var(--ink)]">{session.nome}</p>
          <p className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--text-muted)]">
            {roleLabel}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> Online
          </p>
        </div>
        <Camera className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <ModalShell onClose={() => setOpen(false)}>
            <ModalHeader icon={Camera} eyebrow="Perfil" title="Foto de perfil" onClose={() => setOpen(false)} />
            <div className="flex flex-col items-center gap-4">
              <Avatar name={session.nome} src={avatar} size={96} />
              <div className="flex flex-wrap justify-center gap-2.5">
                <button onClick={() => fileRef.current?.click()} disabled={busy} className="adm-btn adm-btn--primary">
                  <Camera className="h-[18px] w-[18px]" /> {busy ? 'Processando...' : avatar ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {avatar && (
                  <button
                    onClick={remove}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-[0.875rem] font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-bg)]"
                  >
                    <Trash2 className="h-[18px] w-[18px]" /> Remover
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])} />
              <p className="text-center text-[0.72rem] text-[var(--text-muted)]">
                {ALLOWED_LABEL}. Em producao: Supabase Storage/CDN.
              </p>
              {err && <p className="text-[0.75rem] font-medium text-[var(--danger)]">{err}</p>}
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  )
}
