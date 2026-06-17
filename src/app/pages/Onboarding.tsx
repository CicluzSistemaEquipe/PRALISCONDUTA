import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Story } from '@/lib/types'
import { spring } from '@/lib/animations'
import { soundDing } from '@/lib/effects'
import { brand } from '@/lib/brand'
import { StoryProgressBar } from '../components/StoryProgressBar'
import { LisCard } from '../components/LisCard'
import { TextCard } from '../components/TextCard'
import { VideoCard } from '../components/VideoCard'
import { ValuesCard } from '../components/ValuesCard'
import { useSession } from '../context/SessionContext'
import { markRequiredOnboardingSeen } from '@/lib/onboarding'

const STORY_BACKGROUNDS = [
  'linear-gradient(135deg, #b8860b 0%, #8b3f23 100%)',
  'linear-gradient(135deg, #5e3731 0%, #8b3f23 100%)',
  'linear-gradient(135deg, #75483f 0%, #b8860b 100%)',
  'linear-gradient(135deg, #5e3731 0%, #f37435 100%)',
  'linear-gradient(135deg, #5e3731 0%, #75483f 100%)',
  'linear-gradient(135deg, #5e3731 0%, #b8860b 100%)',
  'linear-gradient(135deg, #8b3f23 0%, #5e3731 100%)',
]

const STORIES: Story[] = [
  {
    type: 'lis',
    state: 'celebrating',
    text: 'Oi! Antes de começar, deixa eu te contar quem é a Pralis. Vem comigo nesse tour rapidinho!',
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
  {
    type: 'text',
    tag: 'O que nos guia',
    title: 'Missão & Visão',
    paragraphs: [
      'Nossa missão é levar qualidade, frescor e acolhimento em cada produto, do preparo até o cliente.',
      'Nossa visão é crescer sendo referência em padaria, com pessoas felizes de trabalhar aqui.',
    ],
    highlights: ['qualidade', 'frescor', 'acolhimento', 'felizes'],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { employee } = useSession()
  const [searchParams] = useSearchParams()
  const reviewMode = searchParams.get('review') === '1'
  const [index, setIndex] = useState(() => (reviewMode ? 1 : 0))
  const [dir, setDir] = useState(1)
  const [videoPlaying, setVideoPlaying] = useState(false)

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

  const renderStory = () => {
    if (index < STORIES.length) {
      const s = STORIES[index]
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
          />
        )
      if (s.type === 'text') return <TextCard tag={s.tag} title={s.title} paragraphs={s.paragraphs} highlights={s.highlights} />
    }
    if (index === STORIES.length) return <ValuesCard onNext={next} />
    return (
      <LisCard
        state="celebrating"
        text="Agora que você nos conhece, vamos formalizar sua entrada na família Pralis!"
        onNext={next}
        isLast
      />
    )
  }

  const displayFraction = videoPlaying ? 0.5 : 1
  const currentBg = STORY_BACKGROUNDS[Math.min(index, STORY_BACKGROUNDS.length - 1)]
  const currentStory = index < STORIES.length ? STORIES[index] : null
  const showNextArrow = currentStory?.type === 'text'
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
