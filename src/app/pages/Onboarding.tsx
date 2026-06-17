import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Story } from '@/lib/types'
import { spring } from '@/lib/animations'
import { soundDing } from '@/lib/effects'
import { StoryProgressBar } from '../components/StoryProgressBar'
import { LisCard } from '../components/LisCard'
import { TextCard } from '../components/TextCard'
import { VideoCard } from '../components/VideoCard'
import { ValuesCard } from '../components/ValuesCard'

// Fundo sólido por story — cores chapadas da marca
const STORY_BACKGROUNDS = [
  '#150900',
  '#1a0b00',
  '#0d0800',
  '#091209',
  '#150900',
  '#091209',
  '#150900',
]

const STORIES: Story[] = [
  {
    type: 'lis',
    state: 'celebrating',
    text: 'Oi! Antes de começar, deixa eu te contar quem é a Pralís. Vem comigo nesse tour rapidinho! 🌾',
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
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [videoPlaying, setVideoPlaying] = useState(false)

  const total = STORIES.length + 2 // + card de valores + transição final
  const finish = useCallback(() => {
    localStorage.setItem('pralis:onboarding_seen', '1')
    navigate('/login', { replace: true })
  }, [navigate])

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
    // 0..4 = STORIES, 5 = ValuesCard, 6 = transição (lis)
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
      if (s.type === 'text')
        return (
          <TextCard tag={s.tag} title={s.title} paragraphs={s.paragraphs} highlights={s.highlights} />
        )
    }
    if (index === STORIES.length) return <ValuesCard onNext={next} />
    return (
      <LisCard
        state="celebrating"
        text="Agora que você nos conhece, vamos formalizar sua entrada na família Pralís!"
        onNext={next}
        isLast
      />
    )
  }

  const displayFraction = videoPlaying ? 0.5 : 1
  const currentBg = STORY_BACKGROUNDS[Math.min(index, STORY_BACKGROUNDS.length - 1)]

  // mostra seta de avançar apenas nas cards sem botão próprio (text)
  const currentStory = index < STORIES.length ? STORIES[index] : null
  const showNextArrow = currentStory?.type === 'text'
  const showPrevArrow = index > 0 && currentStory?.type !== 'video'

  return (
    <div className="app-shell" style={{ background: '#000', position: 'relative' }}>

      {/* Fundo animado que muda por story */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: currentBg,
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>

      {/* Padrão de espigas sutil */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url('/assets/brand/padrao-fundo.svg')`,
          backgroundRepeat: 'repeat', backgroundSize: '90px 90px', opacity: 0.04,
        }}
      />

      <div className="relative z-30 px-3 pt-3" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
        <StoryProgressBar total={total} current={index} fraction={displayFraction} />
        <p className="mt-2 text-center font-body text-xs uppercase tracking-wide text-pralis-creme/50">
          Conheça a Pralís
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

      {/* setas de navegação */}
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
              style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}
            >
              <ChevronLeft size={22} color="#fff" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex-1" />

        <AnimatePresence>
          {showNextArrow && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
            >
              <motion.button
                onClick={next}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: ['0 0 0 0 rgba(243,116,53,0)', '0 0 0 8px rgba(243,116,53,0.15)', '0 0 0 0 rgba(243,116,53,0)'],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                aria-label="Próximo"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: '#f37435', border: '1.5px solid rgba(255,255,255,0.35)' }}
              >
                <ChevronRight size={24} color="#fff" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
