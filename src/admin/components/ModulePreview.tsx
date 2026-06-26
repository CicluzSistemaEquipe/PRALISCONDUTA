import type { Module } from '@/lib/types'
import { StoryPlayer } from '@/app/components/StoryPlayer'

/**
 * Pré-visualização FIEL: renderiza o StoryPlayer REAL do app dentro de uma
 * moldura de celular. O `transform: scale` no contêiner faz o `fixed inset-0`
 * do player se posicionar relativo à moldura (não à tela), então o app real
 * cabe no celular — em escala — refletindo o módulo-rascunho ao vivo.
 *
 * `preview` desliga auto-advance, conclusão automática e atalhos de teclado
 * (prop aditiva no StoryPlayer; não muda o app do colaborador). Trocar de bloco
 * remonta o player (key) para "pular" até o slide; editar o bloco atual reflete
 * sem remontar.
 */
const PHONE_W = 300
const PHONE_H = 600
const SCALE = 0.8
const noop = () => {}

export function ModulePreview({ module: m, startIndex = 0 }: { module: Module; startIndex?: number }) {
  const idx = Math.max(0, Math.min(startIndex, m.stories.length - 1))
  return (
    <div>
      <p className="adm-label mb-2 text-center">Pré-visualização · app real</p>
      <div
        className="mx-auto overflow-hidden bg-black"
        style={{
          width: PHONE_W * SCALE + 14,
          height: PHONE_H * SCALE + 14,
          borderRadius: 34,
          border: '7px solid #2b2620',
          boxShadow: '0 26px 70px rgba(0,0,0,0.55)',
        }}
      >
        {m.stories.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-[0.7rem] text-[rgba(247,236,214,0.6)]" style={{ background: '#0a0600' }}>
            Adicione um slide para visualizar.
          </div>
        ) : (
          <div
            style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${SCALE})`, transformOrigin: 'top left', position: 'relative', overflow: 'hidden' }}
          >
            <StoryPlayer
              key={`${m.id}:${idx}`}
              module={m}
              startIndex={idx}
              preview
              watchedVideos={new Set()}
              onClose={noop}
              onModuleComplete={noop}
              onQuizAnswer={noop}
              onVideoWatched={noop}
            />
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[0.7rem] text-[var(--text-muted)]">Use as setas no celular para navegar</p>
    </div>
  )
}
