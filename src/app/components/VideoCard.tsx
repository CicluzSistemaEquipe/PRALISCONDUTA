import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle, Volume2, VolumeX, RotateCcw, Zap } from 'lucide-react'
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
  /** avisa o StoryPlayer p/ pausar a barra de progresso enquanto toca */
  onPlayingChange?: (playing: boolean) => void
  /** reporta progresso 0..1 para a barra de stories do pai */
  onProgress?: (f: number) => void
}

const WATCH_THRESHOLD = 1.0 // 100% — precisa assistir o vídeo completo
const SIM_SECONDS = 14

/**
 * Vídeo em formato stories — preenche toda a área (object-cover).
 * Sem seek/controles nativos; o botão "marcar como assistido" só libera
 * após 100% assistido. No placeholder, o timer só pausa ao perder o foco da aba.
 */
export function VideoCard({
  title,
  description,
  duration,
  src,
  watched,
  onWatched,
  onPlayingChange,
  onProgress,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const rafRef = useRef<number>(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fraction, setFraction] = useState(watched ? 1 : 0)
  const [canMark, setCanMark] = useState(watched)
  const [marked, setMarked] = useState(watched)

  const notify = useCallback(
    (p: boolean) => {
      setPlaying(p)
      onPlayingChange?.(p)
    },
    [onPlayingChange],
  )

  const update = useCallback((f: number) => {
    const c = Math.min(1, Math.max(0, f))
    setFraction(c)
    if (c >= WATCH_THRESHOLD) setCanMark(true)
    onProgress?.(c)
  }, [onProgress])

  // player real
  useEffect(() => {
    const v = videoRef.current
    if (!v || !src) return
    const onTime = () => update(v.duration ? v.currentTime / v.duration : 0)
    const onEnd = () => notify(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
  }, [src, update, notify])

  // placeholder simulado — uma vez iniciado, roda até 100% (não pausa por toque)
  useEffect(() => {
    if (src || !started || fraction >= 1) return
    const start = performance.now() - fraction * SIM_SECONDS * 1000
    const tick = (now: number) => {
      const f = (now - start) / (SIM_SECONDS * 1000)
      update(f)
      if (f >= 1) {
        notify(false)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, src])

  // pausa só quando a aba perde o foco (anti-fraude do placeholder)
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
    if (src && videoRef.current) {
      void videoRef.current.play()
    }
    setStarted(true)
    notify(true)
  }

  const handleMark = () => {
    soundDing()
    hapticTap()
    setMarked(true)
    onWatched()
  }

  const handleRewatch = () => {
    hapticTap()
    setMarked(false)
    setStarted(false)
    setFraction(0)
    setCanMark(false)
    setPlaying(false)
    cancelAnimationFrame(rafRef.current)
    if (src && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
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
          <span
            style={{ fontFamily: 'Montserrat, sans-serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(232,207,160,0.60)', marginTop: 12 }}
          >
            {playing ? 'reproduzindo…' : 'toque para assistir'}
          </span>
        </div>
      )}

      {/* botão play central — só antes de iniciar */}
      <AnimatePresence>
        {!playing && !marked && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startPlayback}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Reproduzir"
          >
            <span
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{ background: '#f37435', boxShadow: '0 8px 32px rgba(243,116,53,0.5)' }}
            >
              <Play size={32} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* mute (vídeo real) */}
      {src && (
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute right-4 top-20 z-10 rounded-full bg-black/40 p-2 text-white"
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* botão DEV SKIP — só em dev mode */}
      {isDevMode() && !marked && (
        <button
          onClick={() => { setCanMark(true); setMarked(true); setFraction(1); onWatched(); soundDing() }}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 20,
            background: '#b8860b',
            border: 'none',
            borderRadius: 8,
            padding: '5px 10px',
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Zap size={12} /> Skip (Dev)
        </button>
      )}

      {/* gradiente inferior + info + botão assistido */}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pb-9 pt-16"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)' }}
      >
        {/* progresso (somente leitura — sem seek) */}
        <div className="mb-3 h-[3px] w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full"
            style={{ width: `${fraction * 100}%`, background: '#f37435' }}
          />
        </div>
        <p className="font-display text-2xl text-white">{title}</p>
        <p className="font-body text-[13px] text-white/60">
          {duration ?? '—'} · narrado pela Lis{description ? ` · ${description}` : ''}
        </p>

        <AnimatePresence mode="wait">
          {marked ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center gap-3"
            >
              <div
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-body font-bold tracking-wide"
                style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' }}
              >
                <CheckCircle size={18} /> Vídeo assistido
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRewatch}
                aria-label="Rever vídeo"
                className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(232,207,160,0.70)' }}
              >
                <RotateCcw size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="mark"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              disabled={!canMark}
              onClick={handleMark}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-body font-bold tracking-wide transition-opacity"
              style={
                canMark
                  ? { background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              <CheckCircle size={18} />
              {canMark ? 'Marcar como assistido' : 'Assista o vídeo completo para liberar'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
