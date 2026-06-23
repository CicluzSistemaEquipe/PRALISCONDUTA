import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundOn } from '@/lib/effects'

const NARRATION_PLAYBACK_RATE = 1.15

interface TextCardProps {
  tag: string
  title: string
  paragraphs: string[]
  highlight?: string
  highlights?: string[]
  keywords?: string[]
  moduleIcon?: string
  accent?: string
  audioSrc?: string
  audioIncludesTitle?: boolean
  narratorVideoSrc?: string
  onProgress?: (f: number) => void
  onNarrationEnd?: () => void
}

function renderWithHighlights(text: string, highlights: string[] = [], active = false) {
  if (highlights.length === 0) return text
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)

  return parts.map((part, i) =>
    highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
      <span
        key={i}
        className="font-semibold"
        style={{
          color: active ? '#ffd3ad' : '#ff9b66',
          textShadow: active ? '0 0 18px rgba(243,116,53,0.32)' : 'none',
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function renderReadingText(
  text: string,
  highlights: string[] = [],
  active = false,
  activeChar = 0,
  revealByChar = false,
) {
  if (!active) return renderWithHighlights(text, highlights)

  const safeChar = Math.max(0, Math.min(text.length, activeChar))
  const beforeSpace = text.lastIndexOf(' ', safeChar)
  const wordStart = beforeSpace === -1 ? 0 : beforeSpace + 1
  const nextSpace = text.slice(safeChar).search(/\s/)
  const wordEnd = nextSpace === -1 ? text.length : Math.max(wordStart + 1, safeChar + nextSpace)
  const futureText = text.slice(wordEnd)

  return (
    <>
      <span>{renderWithHighlights(text.slice(0, wordStart), highlights, true)}</span>
      <motion.span
        key={`${wordStart}-${wordEnd}`}
        initial={{ backgroundSize: '0% 100%' }}
        animate={{ backgroundSize: '100% 100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          display: 'inline',
          padding: '0 3px 2px',
          margin: '0 1px',
          borderRadius: 8,
          color: '#2b160f',
          backgroundImage: 'linear-gradient(90deg, #fff6dd, #ffbd8c)',
          backgroundRepeat: 'no-repeat',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          boxShadow: '0 0 18px rgba(255,230,184,0.30)',
        }}
      >
        {text.slice(wordStart, wordEnd)}
      </motion.span>
      {!revealByChar && <span>{renderWithHighlights(futureText, highlights, true)}</span>}
    </>
  )
}

export function TextCard({
  tag,
  title,
  paragraphs,
  highlight,
  highlights,
  keywords,
  accent = '#b8860b',
  audioSrc,
  audioIncludesTitle = true,
  onProgress,
  onNarrationEnd,
}: TextCardProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeParagraph, setActiveParagraph] = useState(-1)
  const [activeChar, setActiveChar] = useState(0)
  const [narrating, setNarrating] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lisVideoRef = useRef<HTMLVideoElement | null>(null)
  const narrationEndRef = useRef(onNarrationEnd)

  narrationEndRef.current = onNarrationEnd

  const titleChars = audioIncludesTitle ? title.length : 0
  const paragraphChars = paragraphs.reduce((sum, p) => sum + p.length, 0)
  const highlightChars = highlight?.length ?? 0
  const totalNarrationChars = Math.max(1, titleChars + paragraphChars + highlightChars)
  const bubbleVideo = '/videocirculo-dashboard.mp4'

  const syncReadingToProgress = (progress: number) => {
    const cursor = Math.min(totalNarrationChars, Math.max(0, progress * totalNarrationChars))
    const paragraphCursor = cursor - titleChars

    if (paragraphCursor <= 0) {
      setVisibleCount(0)
      setActiveParagraph(-1)
      setActiveChar(0)
      return
    }

    let elapsed = 0
    for (let i = 0; i < paragraphs.length; i += 1) {
      const paragraph = paragraphs[i]
      if (paragraphCursor <= elapsed + paragraph.length) {
        setVisibleCount(i + 1)
        setActiveParagraph(i)
        setActiveChar(Math.max(0, Math.round(paragraphCursor - elapsed)))
        return
      }
      elapsed += paragraph.length
    }

    setVisibleCount(paragraphs.length)
    setActiveParagraph(-1)
    setActiveChar(0)
  }

  useEffect(() => {
    if (audioSrc) return
    setVisibleCount(0)
    setActiveParagraph(-1)
    setActiveChar(0)
    const timers = paragraphs.map((_, i) => window.setTimeout(() => setVisibleCount(i + 1), i * 650 + 220))
    return () => timers.forEach(clearTimeout)
  }, [audioSrc, paragraphs])

  useEffect(() => {
    if (!audioSrc) return
    setVisibleCount(0)
    setActiveParagraph(-1)
    setActiveChar(0)
    onProgress?.(0)
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = NARRATION_PLAYBACK_RATE
    audio.currentTime = 0
    audio.play().catch(() => setNeedsTap(true))
    return () => {
      audio.pause()
      audio.currentTime = 0
      setNeedsTap(false)
    }
  }, [audioSrc, paragraphs.length, onProgress])

  useEffect(() => {
    if (audioSrc || !supportsTTS || !isSoundOn()) return
    window.speechSynthesis.cancel()

    const fullText = [title, ...paragraphs, ...(highlight ? [highlight] : [])].join('. ')
    let offset = title.length + 2
    const ranges = paragraphs.map((p, index) => {
      const range = { index, start: offset, end: offset + p.length }
      offset += p.length + 2
      return range
    })

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(fullText)
      utter.lang = 'pt-BR'
      utter.rate = 0.92
      utter.pitch = 1.05
      utter.volume = 0.9
      const voices = window.speechSynthesis.getVoices()
      const ptBR =
        voices.find((v) => v.lang === 'pt-BR' && v.name.toLowerCase().includes('female')) ||
        voices.find((v) => v.lang.startsWith('pt'))
      if (ptBR) utter.voice = ptBR

      utter.onboundary = (event) => {
        const charIndex = event.charIndex ?? 0
        const current = ranges.find((r) => charIndex >= r.start && charIndex <= r.end)
        if (current) {
          setActiveParagraph(current.index)
          setActiveChar(Math.max(0, charIndex - current.start))
          setVisibleCount((v) => Math.max(v, current.index + 1))
        }
      }
      utter.onend = () => {
        setActiveParagraph(-1)
        setActiveChar(0)
        setNarrating(false)
      }

      setNarrating(true)
      window.speechSynthesis.speak(utter)
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      speak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        speak()
      }
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [title, paragraphs, highlight, supportsTTS, audioSrc])

  useEffect(() => {
    const video = lisVideoRef.current
    if (!video) return
    if (narrating) void video.play()
    else video.pause()
  }, [narrating])

  const toggleNarration = () => {
    if (audioSrc && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.playbackRate = NARRATION_PLAYBACK_RATE
        audioRef.current.play().catch(() => setNeedsTap(true))
      } else {
        audioRef.current.pause()
      }
      return
    }
    if (!supportsTTS) return
    if (narrating) {
      window.speechSynthesis.pause()
      setNarrating(false)
    } else {
      window.speechSynthesis.resume()
      setNarrating(true)
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar px-5 pb-28 pt-6" style={{ background: 'transparent' }}>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          style={{ display: 'none' }}
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = NARRATION_PLAYBACK_RATE
          }}
          onPlay={() => {
            const audio = audioRef.current
            if (audio) audio.playbackRate = NARRATION_PLAYBACK_RATE
            setNarrating(true)
            setNeedsTap(false)
          }}
          onPause={() => {
            setNarrating(false)
          }}
          onEnded={() => {
            const video = lisVideoRef.current
            if (video) {
              video.pause()
              video.currentTime = 0
            }
            setVisibleCount(paragraphs.length)
            setActiveParagraph(-1)
            setActiveChar(0)
            setNarrating(false)
            onProgress?.(1)
            window.setTimeout(() => narrationEndRef.current?.(), 650)
          }}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget
            if (!audio.duration) return
            const progress = audio.currentTime / audio.duration
            syncReadingToProgress(progress)
            onProgress?.(progress)
          }}
          onError={() => {
            setVisibleCount(paragraphs.length)
            setActiveParagraph(-1)
            setActiveChar(0)
            setNarrating(false)
            setNeedsTap(false)
            onProgress?.(1)
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span
              className="tag-chip"
              style={{
                background: '#fff1cf',
                border: '1px solid rgba(255,255,255,0.50)',
                color: '#7a3b1f',
                boxShadow: '0 8px 18px rgba(43,22,15,0.16)',
              }}
            >
              {tag}
            </span>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            style={{
              height: 3,
              width: 86,
              borderRadius: 999,
              transformOrigin: 'left',
              background: `linear-gradient(90deg, ${accent}, #f37435)`,
            }}
          />
        </div>

        <motion.button
          type="button"
          onClick={toggleNarration}
          aria-label={narrating ? 'Pausar narração da Lis' : 'Tocar narração da Lis'}
          className="relative"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={
            needsTap
              ? {
                  opacity: 1,
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(243,116,53,0)',
                    '0 0 0 8px rgba(243,116,53,0.22)',
                    '0 0 0 0 rgba(243,116,53,0)',
                  ],
                }
              : { opacity: 1, scale: 1, y: [0, -3, 0] }
          }
          transition={{
            opacity: { duration: 0.25 },
            scale: { type: 'spring', stiffness: 210, damping: 18 },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 1.15, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            width: 'clamp(88px, 24vw, 112px)',
            height: 'clamp(88px, 24vw, 112px)',
            borderRadius: '50%',
            padding: 0,
            overflow: 'visible',
            border: '3px solid rgba(255,230,184,0.82)',
            background: '#ffffff',
            flexShrink: 0,
            cursor: 'pointer',
            filter: 'drop-shadow(0 12px 20px rgba(43,22,15,0.24)) drop-shadow(0 0 14px rgba(255,230,184,0.16))',
          }}
        >
          <video
            ref={lisVideoRef}
            src={bubbleVideo}
            muted
            loop
            playsInline
            preload="metadata"
            style={{
              width: '116%',
              height: '116%',
              objectFit: 'cover',
              objectPosition: 'center 22%',
              transform: 'translate(-7%, -2%)',
              borderRadius: '50%',
              clipPath: 'circle(50% at 50% 50%)',
              pointerEvents: 'none',
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -8,
              bottom: 4,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: narrating ? '#f37435' : 'rgba(94,55,49,0.88)',
              border: '1.5px solid rgba(255,255,255,0.82)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {narrating ? <Volume2 size={16} color="#ffffff" /> : <VolumeX size={16} color="#ffe6b8" />}
          </span>
        </motion.button>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          fontFamily: 'MadeByDillan, serif',
          fontSize: 'clamp(28px, 8vw, 40px)',
          color: '#ffffff',
          lineHeight: 1.02,
          marginTop: 12,
          textShadow: '0 3px 18px rgba(43,22,15,0.34)',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </motion.h2>

      <div style={{ height: 3, background: 'rgba(255,255,255,0.22)', borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(visibleCount / Math.max(1, paragraphs.length)) * 100}%` }}
          transition={{ duration: 0.35 }}
          style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #ffffff, #ffe6b8)' }}
        />
      </div>

      {keywords && keywords.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {keywords.map((kw) => (
            <span
              key={kw}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(94,55,49,0.82)',
                border: '1px solid rgba(232,207,160,0.32)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: '#ffe6b8',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: visibleCount > 0 ? 1 : 0, y: visibleCount > 0 ? 0 : 14 }}
        transition={{ type: 'spring', stiffness: 190, damping: 22 }}
        style={{
          position: 'relative',
          marginTop: 16,
          borderRadius: 20,
          padding: '14px 14px 13px',
          overflow: 'visible',
          isolation: 'isolate',
          background:
            'linear-gradient(145deg, rgba(94,55,49,0.94), rgba(117,72,63,0.86) 58%, rgba(94,55,49,0.90))',
          border: '1px solid rgba(255,230,184,0.30)',
          boxShadow: '0 14px 28px rgba(43,22,15,0.20), inset 0 1px 0 rgba(255,255,255,0.10)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 10% 14%, rgba(255,230,184,0.14), transparent 30%), linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.10) 48%, transparent 58%)',
            opacity: 0.42,
            zIndex: 0,
            borderRadius: 20,
            pointerEvents: 'none',
          }}
          animate={{ backgroundPosition: ['-180px 0px', '220px 0px'] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <AnimatePresence>
          {paragraphs.slice(0, visibleCount).map((p, i) => {
            const active = activeParagraph === i
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'block',
                  width: '100%',
                  margin: i === 0 ? 0 : '9px 0 0',
                  padding: active ? '8px 10px 9px 16px' : '2px 0 2px 16px',
                  borderRadius: 14,
                  background: active ? 'rgba(255,255,255,0.055)' : 'transparent',
                  border: active ? '1px solid rgba(255,230,184,0.18)' : '1px solid transparent',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 'clamp(14px, 3.9vw, 16px)',
                  fontWeight: active ? 760 : 650,
                  lineHeight: 1.52,
                  color: '#ffffff',
                  overflow: 'visible',
                  overflowWrap: 'anywhere',
                  hyphens: 'auto',
                  textShadow: '0 2px 18px rgba(43,22,15,0.22)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: active ? 8 : 5,
                    bottom: active ? 8 : 5,
                    width: active ? 4 : 2,
                    borderRadius: 999,
                    background: active ? 'linear-gradient(180deg, #fff1cf, #f37435)' : 'rgba(255,230,184,0.24)',
                    boxShadow: active ? '0 0 18px rgba(243,116,53,0.42)' : 'none',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {renderReadingText(p, highlights, active, active ? activeChar : 0, Boolean(audioSrc))}
                </span>
              </motion.p>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {highlight && visibleCount >= paragraphs.length && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            marginTop: 14,
            borderLeft: '3px solid #f37435',
            background: 'rgba(94,55,49,0.92)',
            border: '1px solid var(--orange)',
            borderRadius: '0 16px 16px 0',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(14px, 4vw, 16px)',
              fontStyle: 'italic',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.45,
            }}
          >
            "{highlight}"
          </p>
        </motion.div>
      )}
    </div>
  )
}
