import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Module, QuizQuestion, Story } from '@/lib/types'
import { spring } from '@/lib/animations'
import { soundDing } from '@/lib/effects'
import { brand } from '@/lib/brand'
import { StoryProgressBar } from './StoryProgressBar'
import { ModuleIcon } from './ModuleIcon'
import { LisCard } from './LisCard'
import { TextCard } from './TextCard'
import { VideoCard } from './VideoCard'
import { SummaryCard } from './SummaryCard'
import { QuizCard, type QuizRuntimeState } from './QuizCard'
import { CompletionCard } from './CompletionCard'

interface StoryPlayerProps {
  module: Module
  startIndex?: number
  onClose: () => void
  onIndexChange?: (index: number) => void
  onModuleComplete: () => void
  onNextModule?: () => void
  onQuizAnswer: (moduleId: string, q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onQuizReview?: (moduleId: string, q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onVideoWatched: (moduleId: string, videoId: string) => void
  watchedVideos: Set<string>
  quizSeed?: string
}

function storyPatternAssets(story: Story, index: number) {
  const byType: Record<Story['type'], string[]> = {
    lis: [brand.simboloEspiga, brand.simboloPar],
    text: [brand.symbolUrl, brand.simboloEspiga],
    video: [brand.simboloPar, brand.simboloEspiga],
    summary: [brand.simboloPar, brand.symbolUrl],
    quiz: [brand.simboloEspiga, brand.simboloPar],
    completion: [brand.simboloPar, brand.simboloEspiga],
  }
  const assets = byType[story.type]
  return {
    primary: assets[index % assets.length],
    secondary: assets[(index + 1) % assets.length],
  }
}

export function StoryPlayer({
  module,
  startIndex = 0,
  onClose,
  onIndexChange,
  onModuleComplete,
  onNextModule,
  onQuizAnswer,
  onQuizReview,
  onVideoWatched,
  watchedVideos,
  quizSeed,
}: StoryPlayerProps) {
  const stories = module.stories
  const [index, setIndex] = useState(Math.min(startIndex, stories.length - 1))
  const [dir, setDir] = useState(1)
  const [, setVideoPlaying] = useState(false)
  const [fraction, setFraction] = useState(0)
  const nextRef = useRef<() => void>(() => {})
  const [quizCorrect, setQuizCorrect] = useState(0)
  const [quizTotal, setQuizTotal] = useState(0)
  const [quizStates, setQuizStates] = useState<Record<number, QuizRuntimeState>>({})

  const story = stories[index]

  const go = useCallback(
    (target: number, direction: number, force = false) => {
      window.speechSynthesis?.cancel() // interrompe a narração da Lis ao trocar de card
      if (target < 0) return
      const current = stories[index]
      const waitingForNarration =
        current?.type === 'text' && Boolean(current.audioSrc) && direction > 0 && target > index
      if (!force && waitingForNarration && fraction < 0.995) return
      // bloqueia avanço em slide de vídeo enquanto não assistido
      const waitingForVideo =
        current?.type === 'video' && !watchedVideos.has(current.videoId) && direction > 0
      if (!force && waitingForVideo) return
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
    [stories, index, fraction, watchedVideos, onClose, onModuleComplete, onIndexChange],
  )

  const handleQuizAnswer = useCallback(
    (q: QuizQuestion, sel: number, ok: boolean) => {
      setQuizTotal((t) => t + 1)
      if (ok) setQuizCorrect((c) => c + 1)
      onQuizAnswer(module.id, q, sel, ok)
    },
    [onQuizAnswer, module.id],
  )

  const next = useCallback((force = false) => go(index + 1, 1, force), [go, index])
  const nextNormal = useCallback(() => next(false), [next])
  const prev = useCallback(() => go(index - 1, -1), [go, index])

  // nextRef sempre aponta para a versão mais recente de next (evita closures stale)
  nextRef.current = nextNormal

  // reseta a fração ao trocar de slide
  useEffect(() => {
    setFraction(stories[index]?.type === 'completion' ? 1 : 0)
  }, [index, stories])

  // timer automático Instagram-style para slides lis e text
  useEffect(() => {
    const s = stories[index]
    let duration = 0
    if (s.type === 'lis' && !s.videoSrc) {
      duration = s.text.length * 22 + 2000 // typewriter + 2s de leitura
    } else if (s.type === 'text' && !s.audioSrc) {
      const allText = [s.title, ...s.paragraphs, s.highlight ?? ''].join(' ')
      const words = allText.split(/\s+/).filter(Boolean).length
      duration = Math.max(7000, Math.round((words / 3) * 1000)) // ~3 palavras/s, mín 7s
    } else {
      return
    }
    const start = Date.now()
    const id = setInterval(() => {
      const f = Math.min((Date.now() - start) / duration, 1)
      setFraction(f)
      if (f >= 1) {
        clearInterval(id)
        nextRef.current()
      }
    }, 50)
    return () => clearInterval(id)
  }, [index, stories])

  // marca conclusão ao chegar no card de completion
  useEffect(() => {
    if (story.type === 'completion') onModuleComplete()
  }, [story, onModuleComplete])

  // navegação por teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextNormal()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextNormal, prev, onClose])

  const accent = module.accent
  const [g0] = module.gradient
  const patterns = storyPatternAssets(story, index)

  // a seta de avançar aparece nos cards "passivos" como atalho de skip
  const showNextArrow =
    story.type !== 'lis' &&
    story.type !== 'quiz' &&
    story.type !== 'completion' &&
    story.type !== 'video' &&
    !(story.type === 'text' && story.audioSrc)
  // barra real: vem do timer (lis/text), do onProgress do vídeo, ou completa (completion)
  const displayFraction = fraction

  return (
    <div
      data-testid="story-player"
      className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col"
      style={{
        ['--pralis-accent' as string]: accent,
        ['--story-bg' as string]: g0,
        // cor sólida do módulo em ambos os modos
        background: g0,
      }}
    >
      {/* padrão de espigas em drift lento */}
      <motion.img
        aria-hidden="true"
        src={patterns.primary}
        className="pointer-events-none absolute"
        style={{
          width: story.type === 'quiz' ? 310 : 260,
          maxWidth: '72%',
          right: story.type === 'quiz' ? -112 : -78,
          top: story.type === 'lis' ? 72 : 112,
          opacity: story.type === 'quiz' ? 0.055 : 0.065,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
        }}
        animate={{ y: [0, 14, 0], rotate: [-6, -2, -6], opacity: [0.045, 0.075, 0.045] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        aria-hidden="true"
        src={patterns.secondary}
        className="pointer-events-none absolute"
        style={{
          width: story.type === 'completion' ? 180 : 230,
          maxWidth: '62%',
          left: story.type === 'quiz' ? -96 : -72,
          bottom: story.type === 'quiz' ? 16 : 76,
          opacity: story.type === 'quiz' ? 0.04 : 0.052,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
        }}
        animate={{ y: [0, -12, 0], rotate: [8, 4, 8], opacity: [0.035, 0.06, 0.035] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 18% 16%, rgba(255,255,255,0.10), transparent 26%), radial-gradient(circle at 90% 74%, rgba(243,116,53,0.10), transparent 34%)',
        }}
        animate={{ opacity: [0.36, 0.52, 0.36] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* topo: barra de progresso + fechar */}
      <div
        className="relative z-30 px-3 pb-3 pt-3"
        style={{
          paddingTop: 'calc(var(--safe-top) + 0.75rem)',
          background: 'rgba(0,0,0,0.32)',
          borderBottom: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <StoryProgressBar total={stories.length} current={index} fraction={displayFraction} />
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ModuleIcon type={module.iconType} color="#e8cfa0" size={18} />
            <span className="font-body text-[11px] font-bold uppercase tracking-wide" style={{ color: '#ffffff' }}>
              {module.number} · {module.title}
            </span>
          </span>
          <button onClick={onClose} aria-label="Fechar módulo" className="rounded-full p-1" style={{ color: '#ffffff' }}>
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
              if (info.offset.x < -80 || info.velocity.x < -300) nextNormal()
              else if (info.offset.x > 80 || info.velocity.x > 300) prev()
            }}
            initial={{ x: dir > 0 ? '100%' : '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1, transition: spring }}
            exit={{ x: dir > 0 ? '-100%' : '100%', opacity: 0.4, transition: spring }}
            className="absolute inset-0 overflow-y-auto overscroll-contain no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <StoryContent
              story={story}
              moduleId={module.id}
              accent={module.accent}
              moduleIcon={module.icon}
              isLast={index === stories.length - 1}
              quizScore={{ correct: quizCorrect, total: quizTotal }}
              onNext={nextNormal}
              onNextAfterRequiredMedia={() => next(true)}
              onClose={onClose}
              onNextModule={onNextModule}
              onQuizAnswer={handleQuizAnswer}
              onQuizReview={(q, sel, ok) => onQuizReview?.(module.id, q, sel, ok)}
              onReviewStory={(storyIndex) => go(storyIndex, -1)}
              quizState={quizStates[index]}
              onQuizStateChange={(state) => setQuizStates((prev) => ({ ...prev, [index]: state }))}
              onVideoWatched={(vid) => onVideoWatched(module.id, vid)}
              watchedVideos={watchedVideos}
              onVideoPlayingChange={setVideoPlaying}
              onProgress={setFraction}
              quizSeed={`${quizSeed ?? module.id}:${index}`}
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
            style={{ background: 'rgba(0,0,0,0.32)', border: '1.5px solid rgba(255,255,255,0.40)', backdropFilter: 'none' }}
          >
            <ChevronLeft size={22} color="#fff" />
          </motion.button>
        ) : (
          <span />
        )}

        {showNextArrow && (
          <motion.button
            onClick={nextNormal}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0 0 rgba(0,0,0,0)',
                '0 0 0 8px rgba(0,0,0,0.18)',
                '0 0 0 0 rgba(0,0,0,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            aria-label="Próximo"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: '#ffffff',
              border: '2px solid rgba(255,255,255,0.72)',
              boxShadow: '0 12px 26px rgba(43,22,15,0.20)',
            }}
          >
            <ChevronRight size={24} color="#f37435" />
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
  onNextAfterRequiredMedia: () => void
  onClose: () => void
  onNextModule?: () => void
  onQuizAnswer: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onQuizReview: (q: QuizQuestion, selectedIndex: number, correct: boolean) => void
  onReviewStory: (storyIndex: number) => void
  quizState?: QuizRuntimeState
  onQuizStateChange: (state: QuizRuntimeState) => void
  onVideoWatched: (videoId: string) => void
  watchedVideos: Set<string>
  onVideoPlayingChange: (playing: boolean) => void
  onProgress: (f: number) => void
  quizSeed: string
}

function StoryContent({
  story,
  accent,
  moduleIcon,
  isLast,
  quizScore,
  onNext,
  onNextAfterRequiredMedia,
  onClose,
  onNextModule,
  onQuizAnswer,
  onQuizReview,
  onReviewStory,
  quizState,
  onQuizStateChange,
  onVideoWatched,
  watchedVideos,
  onVideoPlayingChange,
  onProgress,
  quizSeed,
}: StoryContentProps) {
  switch (story.type) {
    case 'lis':
      return (
        <LisCard
          text={story.text}
          state={story.state}
          onNext={onNext}
          isLast={isLast}
          videoSrc={story.videoSrc}
          onProgress={story.videoSrc ? onProgress : undefined}
          onVideoEnd={story.videoSrc ? onNext : undefined}
        />
      )
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
          audioSrc={story.audioSrc}
          audioIncludesTitle={story.audioIncludesTitle}
          narratorVideoSrc={story.narratorVideoSrc}
          onProgress={story.audioSrc ? onProgress : undefined}
          onNarrationEnd={story.audioSrc ? onNextAfterRequiredMedia : undefined}
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
          onWatched={() => onVideoWatched(story.videoId)}
          onAutoAdvance={onNext}
          onPlayingChange={onVideoPlayingChange}
          onProgress={onProgress}
        />
      )
    case 'summary':
      return <SummaryCard title={story.title} bullets={story.bullets} onNext={onNext} />
    case 'quiz':
      return (
        <QuizCard
          intro={story.intro}
          questions={story.questions}
          sampleSize={story.sampleSize}
          randomize={story.randomize}
          quizSeed={quizSeed}
          onAnswer={onQuizAnswer}
          onReviewQuestion={onQuizReview}
          onComplete={onNext}
          onReviewStory={onReviewStory}
          initialState={quizState}
          onStateChange={onQuizStateChange}
          accent={accent}
        />
      )
    case 'completion':
      return <CompletionCard badge={story.badge} message={story.message} quizScore={quizScore} onBack={onClose} onNextModule={onNextModule} />
    default:
      return null
  }
}
