import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Module, QuizQuestion, Story } from '@/lib/types'
import { spring } from '@/lib/animations'
import { soundDing } from '@/lib/effects'
import { brand } from '@/lib/brand'
import { useTheme } from '../context/ThemeContext'
import { StoryProgressBar } from './StoryProgressBar'
import { ModuleIcon } from './ModuleIcon'
import { LisCard } from './LisCard'
import { TextCard } from './TextCard'
import { VideoCard } from './VideoCard'
import { SummaryCard } from './SummaryCard'
import { QuizCard } from './QuizCard'
import { CompletionCard } from './CompletionCard'

interface StoryPlayerProps {
  module: Module
  startIndex?: number
  onClose: () => void
  onIndexChange?: (index: number) => void
  onModuleComplete: () => void
  onQuizAnswer: (moduleId: string, q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onVideoWatched: (moduleId: string, videoId: string) => void
  watchedVideos: Set<string>
}

export function StoryPlayer({
  module,
  startIndex = 0,
  onClose,
  onIndexChange,
  onModuleComplete,
  onQuizAnswer,
  onVideoWatched,
  watchedVideos,
}: StoryPlayerProps) {
  const stories = module.stories
  const [index, setIndex] = useState(Math.min(startIndex, stories.length - 1))
  const [dir, setDir] = useState(1)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)

  const story = stories[index]

  const go = useCallback(
    (target: number, direction: number) => {
      window.speechSynthesis?.cancel() // interrompe a narração da Lis ao trocar de card
      if (target < 0) return
      if (target >= stories.length) {
        onModuleComplete()
        onClose()
        return
      }
      setDir(direction)
      setIndex(target)
      onIndexChange?.(target)
      soundDing()
    },
    [stories.length, onClose, onModuleComplete, onIndexChange],
  )

  const handleQuizAnswer = useCallback(
    (q: QuizQuestion, sel: number, ok: boolean) => {
      setQuizTotal((t) => t + 1)
      if (ok) setQuizCorrect((c) => c + 1)
      onQuizAnswer(module.id, q, sel, ok)
    },
    [onQuizAnswer, module.id],
  )

  const next = useCallback(() => go(index + 1, 1), [go, index])
  const prev = useCallback(() => go(index - 1, -1), [go, index])

  // marca conclusão ao chegar no card de completion
  useEffect(() => {
    if (story.type === 'completion') onModuleComplete()
  }, [story, onModuleComplete])

  // navegação por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, onClose])

  const { theme } = useTheme()
  const isLight = theme === 'light'
  const accent = module.accent
  const [g0, g1] = module.gradient

  // a seta de avançar aparece nos cards "passivos" (os interativos têm controle próprio)
  const showNextArrow = story.type !== 'quiz' && story.type !== 'completion' && story.type !== 'video'
  // segmento atual sempre cheio (sem timer); no vídeo, acompanha a reprodução
  const displayFraction = videoPlaying ? 0.5 : 1

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col"
      style={{
        ['--pralis-accent' as string]: accent,
        background: `linear-gradient(160deg, ${g0} 0%, ${g1} 48%, ${isLight ? '#fdf6ec' : '#000'} 100%)`,
      }}
    >
      {/* padrão de espigas em drift lento */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url(${brand.patternUrl})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '70px',
          opacity: 0.06,
        }}
        animate={{ backgroundPosition: ['0px 0px', '70px 70px'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* topo: barra de progresso + fechar */}
      <div className="relative z-30 px-3 pt-3" style={{ paddingTop: 'calc(var(--safe-top) + 0.75rem)' }}>
        <StoryProgressBar total={stories.length} current={index} fraction={displayFraction} />
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ModuleIcon type={module.iconType} color={accent} size={20} />
            <span className="font-body text-xs font-semibold uppercase tracking-wide text-pralis-creme/80">
              {module.number} · {module.title}
            </span>
          </span>
          <button onClick={onClose} aria-label="Fechar módulo" className="rounded-full p-1 text-pralis-creme/80">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* conteúdo do story com transição horizontal + swipe */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
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
            <StoryContent
              story={story}
              moduleId={module.id}
              accent={module.accent}
              moduleIcon={module.icon}
              isLast={index === stories.length - 1}
              quizScore={{ correct: quizCorrect, total: quizTotal }}
              onNext={next}
              onClose={onClose}
              onQuizAnswer={handleQuizAnswer}
              onVideoWatched={(vid) => onVideoWatched(module.id, vid)}
              watchedVideos={watchedVideos}
              onVideoPlayingChange={setVideoPlaying}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* setas de navegação — sempre visíveis */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex items-center justify-between px-5">
        {index > 0 ? (
          <motion.button
            onClick={prev}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.75, x: 0 }}
            aria-label="Anterior"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: isLight ? 'rgba(94,55,49,0.12)' : 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}
          >
            <ChevronLeft size={22} color={isLight ? '#5e3731' : '#fff'} />
          </motion.button>
        ) : (
          <span />
        )}

        {showNextArrow && (
          <motion.button
            onClick={next}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0 0 rgba(243,116,53,0)',
                '0 0 0 8px rgba(243,116,53,0.15)',
                '0 0 0 0 rgba(243,116,53,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            aria-label="Próximo"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, #f37435, #b8860b)',
              border: '1.5px solid rgba(255,255,255,0.35)',
            }}
          >
            <ChevronRight size={24} color="#fff" />
          </motion.button>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------

interface StoryContentProps {
  story: Story
  moduleId: string
  accent: string
  moduleIcon: string
  isLast: boolean
  quizScore: { correct: number; total: number }
  onNext: () => void
  onClose: () => void
  onQuizAnswer: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onVideoWatched: (videoId: string) => void
  watchedVideos: Set<string>
  onVideoPlayingChange: (playing: boolean) => void
}

function StoryContent({
  story,
  accent,
  moduleIcon,
  isLast,
  quizScore,
  onNext,
  onClose,
  onQuizAnswer,
  onVideoWatched,
  watchedVideos,
  onVideoPlayingChange,
}: StoryContentProps) {
  switch (story.type) {
    case 'lis':
      return <LisCard text={story.text} state={story.state} onNext={onNext} isLast={isLast} />
    case 'text':
      return (
        <TextCard
          tag={story.tag}
          title={story.title}
          paragraphs={story.paragraphs}
          highlight={story.highlight}
          highlights={story.highlights}
          keywords={story.keywords}
          accent={accent}
          moduleIcon={moduleIcon}
        />
      )
    case 'video':
      return (
        <VideoCard
          videoId={story.videoId}
          title={story.title}
          description={story.description}
          duration={story.duration}
          src={story.src}
          watched={watchedVideos.has(story.videoId)}
          onWatched={() => {
            onVideoWatched(story.videoId)
            setTimeout(onNext, 1400)
          }}
          onPlayingChange={onVideoPlayingChange}
        />
      )
    case 'summary':
      return <SummaryCard title={story.title} bullets={story.bullets} onNext={onNext} />
    case 'quiz':
      return <QuizCard questions={story.questions} onAnswer={onQuizAnswer} onComplete={onNext} accent={accent} />
    case 'completion':
      return <CompletionCard badge={story.badge} message={story.message} quizScore={quizScore} onBack={onClose} />
    default:
      return null
  }
}
