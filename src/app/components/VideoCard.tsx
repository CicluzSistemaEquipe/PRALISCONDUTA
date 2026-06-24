import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle, Volume2, VolumeX, Zap, RotateCcw } from 'lucide-react'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { hapticTap, soundDing } from '@/lib/effects'
import { isDevMode } from '@/lib/devMode'

interface VideoCardProps {
  videoId: string
  title: string
  description?: string
  duration?: string
  src?: string
  watched: boolean
  onWatched: () => void
  /** chamado quando o vídeo termina pela primeira vez — aciona o avanço automático */
  onAutoAdvance?: () => void
  onPlayingChange?: (playing: boolean) => void
  onProgress?: (f: number) => void
}

const WATCH_THRESHOLD = 1.0
const SIM_SECONDS = 14

export function VideoCard({
  title,
  description,
  duration,
  src,
  watched,
  onWatched,
  onAutoAdvance,
  onPlayingChange,
  onProgress,
}: VideoCardProps) {
  const videoRef      = useRef<HTMLVideoElement | null>(null)
  const rafRef        = useRef<number>(0)
  const completedRef  = useRef(watched)   // true quando completou (evita double-fire)
  const isRewatchRef  = useRef(false)     // true quando está revendo (bloqueia auto-advance)

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [muted,   setMuted]   = useState(false)
  const [fraction, setFraction] = useState(watched ? 1 : 0)
  const [marked,   setMarked]   = useState(watched)

  const notify = useCallback((p: boolean) => {
    setPlaying(p)
    onPlayingChange?.(p)
  }, [onPlayingChange])

  // dispara quando vídeo chega a 100%
  const update = useCallback((f: number) => {
    const c = Math.min(1, Math.max(0, f))
    setFraction(c)
    onProgress?.(c)

    if (c >= WATCH_THRESHOLD && !completedRef.current) {
      completedRef.current = true
      notify(false)
      setPlaying(false)
      setMarked(true)
      soundDing()
      onWatched()
      if (!isRewatchRef.current) {
        // primeira conclusão: avança automaticamente
        setTimeout(() => onAutoAdvance?.(), 350)
      }
      isRewatchRef.current = false
    }
  }, [notify, onProgress, onWatched, onAutoAdvance])

  // player real
  useEffect(() => {
    const v = videoRef.current
    if (!v || !src) return
    const onTime = () => update(v.duration ? v.currentTime / v.duration : 0)
    const onEnd  = () => notify(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
  }, [src, update, notify])

  // placeholder simulado — não pausa por toque
  useEffect(() => {
    if (src || !started || fraction >= 1) return
    const start = performance.now() - fraction * SIM_SECONDS * 1000
    const tick = (now: number) => {
      const f = (now - start) / (SIM_SECONDS * 1000)
      update(f)
      if (f >= 1) { notify(false); return }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, src])

  // pausa ao perder foco da aba
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setStarted(false)
        notify(false)
        if (src && videoRef.current) videoRef.current.pause()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [src, notify])

  const startPlayback = () => {
    hapticTap()
    if (marked) {
      // rewatch — reseta progresso mas mantém marcado
      completedRef.current = false
      isRewatchRef.current = true
      setFraction(0)
      cancelAnimationFrame(rafRef.current)
      if (src && videoRef.current) videoRef.current.currentTime = 0
    }
    if (src && videoRef.current) void videoRef.current.play()
    setStarted(true)
    notify(true)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">

      {/* vídeo ou placeholder */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          playsInline
          muted={muted}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#0d0800' }}>
          <motion.img
            src={brand.symbolUrl}
            alt=""
            style={{ width: 72, filter: FILTER_WHITE, opacity: 0.85 }}
            animate={playing ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(232,207,160,0.60)', marginTop: 12 }}>
            {playing ? 'reproduzindo…' : 'toque para assistir'}
          </span>
        </div>
      )}

      {/* botão play — aparece quando não está tocando */}
      <AnimatePresence>
        {!playing && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startPlayback}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={marked ? 'Rever vídeo' : 'Reproduzir'}
          >
            <span
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{ background: marked ? 'rgba(0,0,0,0.55)' : '#f37435', boxShadow: marked ? 'none' : '0 8px 32px rgba(243,116,53,0.5)' }}
            >
              {marked
                ? <RotateCcw size={28} color="rgba(232,207,160,0.85)" />
                : <Play size={32} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
              }
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* mute (só com vídeo real) */}
      {src && (
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute right-4 top-20 z-10 rounded-full bg-black/40 p-2 text-white"
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* DEV SKIP */}
      {isDevMode() && !marked && (
        <button
          onClick={() => {
            completedRef.current = true
            setFraction(1)
            setMarked(true)
            setPlaying(false)
            notify(false)
            soundDing()
            onWatched()
            setTimeout(() => onAutoAdvance?.(), 350)
          }}
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 20,
            background: '#b8860b', border: 'none', borderRadius: 8,
            padding: '5px 10px', color: '#fff',
            fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <Zap size={12} /> Skip (Dev)
        </button>
      )}

      {/* gradiente inferior + info do vídeo */}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-9 pt-16 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
      >
        {/* barra de progresso */}
        <div className="mb-3 h-[3px] w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full transition-all" style={{ width: `${fraction * 100}%`, background: '#f37435' }} />
        </div>

        <p className="font-display text-2xl text-white">{title}</p>
        <p className="font-body text-[13px] text-white/60">
          {duration ?? '—'} · narrado pela Lis{description ? ` · ${description}` : ''}
        </p>

        {/* indicador de assistido — substitui o botão */}
        <AnimatePresence>
          {marked && (
            <motion.div
              key="watched-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center gap-2 font-body text-sm font-semibold"
              style={{ color: 'rgba(74,222,128,0.9)' }}
            >
              <CheckCircle size={16} />
              Assistido · deslize para continuar
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
