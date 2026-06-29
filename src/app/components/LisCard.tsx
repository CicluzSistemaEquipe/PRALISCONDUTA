import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { LisState } from '@/lib/types'
import { LisAvatar } from './LisAvatar'
import { brand } from '@/lib/brand'

interface LisCardProps {
  text: string
  state?: LisState
  onNext: () => void
  isLast?: boolean
  videoSrc?: string
  /** MP3 da Lis; quando presente a legenda sincroniza com o tempo do áudio. */
  audioSrc?: string
  onProgress?: (f: number) => void
  onVideoEnd?: () => void
  onAudioEnd?: () => void
}

export function LisCard({ text, state = 'talking', onNext, isLast, videoSrc, audioSrc, onProgress, onVideoEnd, onAudioEnd }: LisCardProps) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // typewriter — só quando NÃO há áudio (o áudio sincroniza a legenda).
  useEffect(() => {
    if (audioSrc) return
    setShown('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 22)
    return () => clearInterval(id)
  }, [text, audioSrc])

  // áudio (MP3) — reproduz e sincroniza a legenda. Se o autoplay for bloqueado,
  // revela o texto completo e libera o avanço (sem travar o colaborador).
  useEffect(() => {
    if (!audioSrc) return
    setShown('')
    setDone(false)
    onProgress?.(0)
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => { setShown(text); setDone(true); onProgress?.(1) })
    return () => { a.pause() }
  }, [audioSrc, text, onProgress])

  // --- layout com vídeo grande (hero) ---
  if (videoSrc) {
    return (
      <div className="relative flex h-full flex-col" style={{ background: 'transparent' }}>
        {/* vídeo ocupa ~60% da tela */}
        <div style={{ position: 'relative', flex: '0 0 62%', overflow: 'hidden', background: 'var(--story-bg, #b8860b)' }}>
          <video
            src={videoSrc}
            autoPlay
            muted={false}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom' }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget
              if (v.duration) onProgress?.(v.currentTime / v.duration)
            }}
            onEnded={() => onVideoEnd?.()}
          />
          {/* sombra de fade na base do vídeo para fundir com o fundo do módulo */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              background: 'linear-gradient(to bottom, transparent, var(--story-bg, #b8860b))',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* texto + botão na parte de baixo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, padding: '0 20px 100px' }}>
          <div
            style={{
              background: 'rgba(106,64,56,0.88)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(232,207,160,0.26)',
              borderRadius: '10px 22px 22px 22px',
              padding: '16px 18px',
              boxShadow: '0 14px 32px rgba(43,22,15,0.16)',
            }}
          >
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontStyle: 'italic',
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: '#ffffff',
                lineHeight: 1.6,
                overflowWrap: 'anywhere',
              }}
            >
              {shown}
              {!done && <span className="ml-0.5 inline-block animate-cursor-blink">|</span>}
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
            onClick={onNext}
            className="btn-next-white w-full"
            disabled={!done}
          >
            <span>{isLast ? 'Concluir' : 'Próximo'}</span>
            <ArrowRight className="h-5 w-5" color="#f37435" />
          </motion.button>
        </div>
      </div>
    )
  }

  // --- layout padrão (avatar animado) ---
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 px-5 pb-24 pt-8 text-center">
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          style={{ display: 'none' }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget
            if (!a.duration) return
            const f = a.currentTime / a.duration
            setShown(text.slice(0, Math.max(1, Math.floor(text.length * f))))
            onProgress?.(f)
          }}
          onEnded={() => { setShown(text); setDone(true); onProgress?.(1); onAudioEnd?.() }}
          onError={() => { setShown(text); setDone(true); onProgress?.(1) }}
        />
      )}
      <motion.img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-16"
        style={{ width: 84, opacity: 0.08, filter: 'brightness(0) invert(1)' }}
        animate={{ y: [0, 8, 0], opacity: [0.06, 0.11, 0.06] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={{ scale: { type: 'spring', stiffness: 200, damping: 18 }, opacity: { duration: 0.25 }, y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <LisAvatar state={state} size={112} />
      </motion.div>

      <div
        className="relative w-full no-scrollbar"
        style={{
          minHeight: 112,
          maxHeight: '38vh',
          overflowY: 'auto',
          background: 'rgba(106,64,56,0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(232,207,160,0.26)',
          borderRadius: '10px 22px 22px 22px',
          padding: '16px 18px',
          boxShadow: '0 14px 32px rgba(43,22,15,0.16)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid rgba(232,207,160,0.32)',
          }}
        />
        <p
          className="leading-relaxed"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontStyle: 'italic',
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#ffffff',
            overflowWrap: 'anywhere',
            wordBreak: 'normal',
            hyphens: 'auto',
          }}
        >
          {shown}
          {!done && <span className="ml-0.5 inline-block animate-cursor-blink">|</span>}
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
        onClick={onNext}
        className="btn-next-white w-full"
        disabled={!done}
      >
        <span>{isLast ? 'Concluir' : 'Próximo'}</span>
        <ArrowRight className="h-5 w-5" color="#f37435" />
      </motion.button>
    </div>
  )
}
