import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Story } from '@/lib/types'
import { spring } from '@/lib/animations'
import { soundDing, fireConfetti, soundComplete } from '@/lib/effects'
import { brand } from '@/lib/brand'
import { StoryProgressBar } from '../components/StoryProgressBar'
import { LisCard } from '../components/LisCard'
import { VideoCard } from '../components/VideoCard'
import { ValuesCard } from '../components/ValuesCard'
import { useSession } from '../context/SessionContext'
import { markRequiredOnboardingSeen } from '@/lib/onboarding'

const STORY_BACKGROUNDS = [
  '#1f1102', // slide 0 — Lis intro (cor do vídeo)
  '#0d0800',
  '#150900',
  '#0d0800',
  '#1a0e00',
  '#150900',
]

const STORIES: Story[] = [
  {
    type: 'lis',
    state: 'celebrating',
    text: 'Oi! Antes de começar, deixa eu te contar um pouco mais sobre a Pralís. Vem comigo nesse tour rapidinho!',
  },
  {
    type: 'video',
    videoId: 'mvv-missao',
    title: 'Nossa Missão',
    description: 'O que nos move todos os dias.',
    duration: '1:20',
  },
  {
    type: 'video',
    videoId: 'mvv-visao',
    title: 'Nossa Visão',
    description: 'Aonde queremos chegar juntos.',
    duration: '1:05',
  },
  {
    type: 'video',
    videoId: 'mvv-valores',
    title: 'Nossos Valores',
    description: 'A base de tudo o que fazemos.',
    duration: '1:30',
  },
]

function LisVideoCard({ text, src, onNext, onProgress }: { text: string; src: string; onNext: () => void; onProgress?: (f: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const waitingForGestureRef = useRef(false)
  const [visibleWords, setVisibleWords] = useState(0)
  const words = text.split(' ')

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const playWithAudio = () => {
      v.muted = false
      v.volume = 1
      void v.play().catch(() => {
        waitingForGestureRef.current = true
      })
    }

    const resumeAfterGesture = () => {
      if (!waitingForGestureRef.current) return
      waitingForGestureRef.current = false
      playWithAudio()
    }

    v.currentTime = 0
    playWithAudio()
    window.addEventListener('pointerdown', resumeAfterGesture)
    window.addEventListener('keydown', resumeAfterGesture)

    return () => {
      window.removeEventListener('pointerdown', resumeAfterGesture)
      window.removeEventListener('keydown', resumeAfterGesture)
    }
  }, [])

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const progress = v.currentTime / v.duration
    setVisibleWords(Math.ceil(progress * words.length))
    onProgress?.(progress)
  }

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#1f1102' }}>
      {/* SVG patterns decorativos — atrás da Lis */}
      <motion.img
        src={brand.simboloEspiga}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ zIndex: 0, width: 240, right: -80, top: 60, opacity: 0.07, filter: 'brightness(0) invert(1)', mixBlendMode: 'screen', pointerEvents: 'none' }}
        animate={{ y: [0, 12, 0], rotate: [-4, -1, -4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={brand.simboloPar}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ zIndex: 0, width: 170, left: -55, bottom: 160, opacity: 0.055, filter: 'brightness(0) invert(1)', mixBlendMode: 'screen', pointerEvents: 'none' }}
        animate={{ y: [0, -10, 0], rotate: [6, 2, 6] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Vídeo ocupa toda a altura — Lis transparente por cima de tudo */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center top',
          display: 'block',
          zIndex: 2,
        }}
        onEnded={onNext}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={() => {
          const v = videoRef.current
          if (!v) return
          if (v.paused) {
            void v.play().catch(() => {
              waitingForGestureRef.current = true
            })
          }
        }}
        onError={() => {
          const v = videoRef.current
          if (!v) return
          v.load()
        }}
      />

      {/* Gradiente suave atrás da caixa de texto */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: 'linear-gradient(to top, rgba(31,17,2,0.95) 60%, transparent)',
        zIndex: 3,
        pointerEvents: 'none',
      }} />

      {/* Caixa de legenda — overlay no bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 4,
        padding: '0 20px 36px',
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(94,55,49,0.88)',
          border: '1px solid rgba(255,230,184,0.22)',
          borderRadius: 18,
          padding: '14px 20px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 600, lineHeight: 1.65, textAlign: 'center', margin: 0 }}>
            {words.map((word, i) => (
              <motion.span
                key={i}
                animate={{ opacity: i < visibleWords ? 1 : 0.2 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ display: 'inline-block', marginRight: '0.28em', color: i < visibleWords ? '#ffffff' : 'rgba(255,255,255,0.2)' }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>
      </div>
    </div>
  )
}

function LisFinalCard({ onNext }: { onNext: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
    // Confetti e som ao entrar
    fireConfetti(2800)
    soundComplete()
  }, [])

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#1f1102' }}>
      {/* SVG decorativo */}
      <motion.img
        src={brand.simboloEspiga}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ zIndex: 2, width: 200, right: -60, top: 30, opacity: 0.07, filter: 'brightness(0) invert(1)', mixBlendMode: 'screen', pointerEvents: 'none' }}
        animate={{ y: [0, 10, 0], rotate: [-4, -1, -4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Gradiente entre lis e texto */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 120,
        background: 'linear-gradient(to bottom, transparent, rgba(31,17,2,0.95))',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Lis — por cima de tudo, ocupa os primeiros 62% do topo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '62%', zIndex: 3 }}>
        <video
          ref={videoRef}
          src="/video-final-lis-feliz-alpha.webm"
          muted
          autoPlay
          playsInline
          loop
          style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center top', display: 'block' }}
        />
      </div>

      {/* Área de texto e botão — parte inferior */}
      <div style={{
        position: 'absolute',
        top: '62%',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px 40px',
        gap: 16,
      }}>
        {/* Badge de conclusão */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(184,134,11,0.18)',
            border: '1.5px solid rgba(184,134,11,0.6)',
            borderRadius: 50,
            padding: '6px 18px',
          }}
        >
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#d4a86a', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
            🎉 Etapa concluída!
          </span>
        </motion.div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            background: 'rgba(94,55,49,0.92)',
            border: '1px solid rgba(255,210,140,0.28)',
            borderRadius: 20,
            padding: '18px 22px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          }}
        >
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 700, lineHeight: 1.65, textAlign: 'center', margin: 0, color: '#ffffff' }}>
            Agora que você nos conhece, vamos formalizar sua entrada na família Pralís!
          </p>
        </motion.div>

        {/* Botão */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #d4a030, #b8860b)',
            border: 'none',
            borderRadius: 50,
            padding: '15px 0',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: '0 6px 24px rgba(184,134,11,0.45)',
          }}
        >
          Entrar agora →
        </motion.button>
      </div>
    </div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { employee } = useSession()
  const [searchParams] = useSearchParams()
  const reviewMode = searchParams.get('review') === '1'
  const [index, setIndex] = useState(() => (reviewMode ? 1 : 0))
  const [dir, setDir] = useState(1)
  const [, setVideoPlaying] = useState(false)
  const [fraction, setFraction] = useState(0)
  const nextRef = useRef<() => void>(() => {})

  const total = reviewMode ? STORIES.length + 1 : STORIES.length + 2
  const finish = useCallback(() => {
    if (reviewMode) {
      navigate('/lis', { replace: true })
      return
    }
    const current = employee?.id ?? localStorage.getItem('pralis:current-employee')
    markRequiredOnboardingSeen(current)
    navigate(current ? '/feed' : '/login', { replace: true })
  }, [employee?.id, navigate, reviewMode])

  const go = useCallback(
    (target: number, direction: number) => {
      if (target < 0) return
      if (target >= total) {
        finish()
        return
      }
      setDir(direction)
      setIndex(target)
      soundDing()
    },
    [total, finish],
  )

  const next = () => go(index + 1, 1)
  const prev = () => go(index - 1, -1)

  // Atualiza ref sempre para evitar closure stale nos timers
  nextRef.current = next

  // Reset da barra ao trocar de slide
  useEffect(() => { setFraction(0) }, [index])

  // Timer para slides só-texto (ValuesCard) — 5.5s → avança automaticamente
  useEffect(() => {
    if (index !== STORIES.length) return
    const DURATION = 5500
    const start = Date.now()
    const id = setInterval(() => {
      const f = Math.min((Date.now() - start) / DURATION, 1)
      setFraction(f)
      if (f >= 1) { clearInterval(id); nextRef.current() }
    }, 50)
    return () => clearInterval(id)
  }, [index])

  const renderStory = () => {
    if (index < STORIES.length) {
      const s = STORIES[index]
      if (s.type === 'lis' && index === 0) {
        return <LisVideoCard text={s.text} src="/intro2-lis-tour-alpha.webm" onNext={next} onProgress={setFraction} />
      }
      if (s.type === 'lis') return <LisCard text={s.text} state={s.state} onNext={next} />
      if (s.type === 'video')
        return (
          <VideoCard
            videoId={s.videoId}
            title={s.title}
            description={s.description}
            duration={s.duration}
            watched={false}
            onWatched={() => setTimeout(next, 1200)}
            onPlayingChange={setVideoPlaying}
            onProgress={setFraction}
          />
        )
    }
    if (index === STORIES.length) return <ValuesCard onNext={next} />
    return <LisFinalCard onNext={next} />
  }

  const displayFraction = fraction
  const currentBg = STORY_BACKGROUNDS[Math.min(index, STORY_BACKGROUNDS.length - 1)]
  const currentStory = index < STORIES.length ? STORIES[index] : null
  const showNextArrow = false
  const showPrevArrow = index > 0 && currentStory?.type !== 'video'

  return (
    <div className="app-shell" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: currentBg,
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>

      <motion.img
        src={index % 2 === 0 ? brand.simboloEspiga : brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          zIndex: 0,
          width: 260,
          right: -88,
          top: 96,
          opacity: 0.055,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
        }}
        animate={{ y: [0, 14, 0], rotate: [-5, -1, -5], opacity: [0.04, 0.065, 0.04] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={index % 2 === 0 ? brand.symbolUrl : brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          zIndex: 0,
          width: 190,
          left: -66,
          bottom: 98,
          opacity: 0.045,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
        }}
        animate={{ y: [0, -12, 0], rotate: [7, 3, 7], opacity: [0.035, 0.055, 0.035] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-30 px-3 pt-3" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
        <StoryProgressBar total={total} current={index} fraction={displayFraction} />
        <p className="mt-2 text-center font-body text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.76)' }}>
          Conheça a Pralis
        </p>
      </div>

      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80 || info.velocity.x < -300) next()
              else if (info.offset.x > 80 || info.velocity.x > 300) prev()
            }}
            initial={{ x: dir > 0 ? '100%' : '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1, transition: spring }}
            exit={{ x: dir > 0 ? '-100%' : '100%', opacity: 0.4, transition: spring }}
            className="absolute inset-0"
          >
            {renderStory()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex items-center justify-between px-5">
        <AnimatePresence>
          {showPrevArrow && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 0.75, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={prev}
              whileTap={{ scale: 0.9 }}
              aria-label="Anterior"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(10px)' }}
            >
              <ChevronLeft size={22} color="#ffffff" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <AnimatePresence>
          {showNextArrow && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <motion.button
                onClick={next}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                aria-label="Próximo"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: '#ffffff', border: '1.5px solid rgba(255,255,255,0.72)', boxShadow: '0 12px 26px rgba(43,22,15,0.20)' }}
              >
                <ChevronRight size={24} color="#f37435" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
