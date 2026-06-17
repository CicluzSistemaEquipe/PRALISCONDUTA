import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundOn } from '@/lib/effects'
import { TopicIllustration } from './TopicIllustration'

interface TextCardProps {
  tag: string
  title: string
  paragraphs: string[]
  highlight?: string
  highlights?: string[]
  keywords?: string[]
  moduleIcon?: string
  accent?: string
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

function renderReadingText(text: string, highlights: string[] = [], active = false, activeChar = 0) {
  if (!active) return renderWithHighlights(text, highlights)

  const safeChar = Math.max(0, Math.min(text.length, activeChar))
  const beforeSpace = text.lastIndexOf(' ', safeChar)
  const wordStart = beforeSpace === -1 ? 0 : beforeSpace + 1
  const nextSpace = text.slice(safeChar).search(/\s/)
  const wordEnd = nextSpace === -1 ? text.length : Math.max(wordStart + 1, safeChar + nextSpace)

  return (
    <>
      <span>{renderWithHighlights(text.slice(0, wordStart), highlights, true)}</span>
      <motion.span
        key={`${wordStart}-${wordEnd}`}
        initial={{ backgroundSize: '0% 100%' }}
        animate={{ backgroundSize: '100% 100%' }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
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
          boxShadow: '0 0 22px rgba(255,230,184,0.34)',
        }}
      >
        {text.slice(wordStart, wordEnd)}
      </motion.span>
      <span>{renderWithHighlights(text.slice(wordEnd), highlights, true)}</span>
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
}: TextCardProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeParagraph, setActiveParagraph] = useState(-1)
  const [activeChar, setActiveChar] = useState(0)
  const [narrating, setNarrating] = useState(false)
  const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    setVisibleCount(0)
    setActiveParagraph(-1)
    setActiveChar(0)
    const timers: number[] = []
    paragraphs.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVisibleCount(i + 1), i * 900 + 350))
    })
    return () => timers.forEach(clearTimeout)
  }, [paragraphs])

  useEffect(() => {
    if (!supportsTTS || !isSoundOn()) return
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
  }, [title, paragraphs, highlight, supportsTTS])

  const toggleNarration = () => {
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
    <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar px-6 pb-32 pt-10" style={{ background: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 0 }}>
          {supportsTTS && (
            <button
              onClick={toggleNarration}
              aria-label={narrating ? 'Silenciar narração' : 'Ativar narração'}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(94,55,49,0.82)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(232,207,160,0.28)',
              }}
            >
              {narrating ? <Volume2 size={17} color="#ffe6b8" /> : <VolumeX size={17} color="#d4a38f" />}
            </button>
          )}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <span className="tag-chip">{tag}</span>
          </motion.div>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, -2, 2, 0], y: [0, -4, 0] }}
          transition={{
            opacity: { duration: 0.25 },
            scale: { type: 'spring', stiffness: 210, damping: 18 },
            rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            width: 108,
            height: 108,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            filter: 'drop-shadow(0 14px 22px rgba(43,22,15,0.26)) drop-shadow(0 0 16px rgba(255,230,184,0.16))',
          }}
        >
          <TopicIllustration tag={tag} accent="#fff1cf" size={86} />
        </motion.div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          fontFamily: 'MadeByDillan, serif',
          fontSize: 'clamp(32px, 9vw, 46px)',
          color: '#ffffff',
          lineHeight: 1.04,
          marginTop: 18,
          textShadow: '0 3px 18px rgba(43,22,15,0.34)',
          overflowWrap: 'anywhere',
        }}
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          height: 3,
          width: 78,
          marginTop: 18,
          borderRadius: 999,
          transformOrigin: 'left',
          background: `linear-gradient(90deg, ${accent}, #f37435)`,
        }}
      />

      <div style={{ height: 3, background: 'rgba(255,255,255,0.22)', borderRadius: 999, marginTop: 16, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(visibleCount / Math.max(1, paragraphs.length)) * 100}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #ffffff, #ffe6b8)' }}
        />
      </div>

      {keywords && keywords.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 18 }}>
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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: visibleCount > 0 ? 1 : 0, y: visibleCount > 0 ? 0 : 18 }}
        transition={{ type: 'spring', stiffness: 190, damping: 22 }}
        style={{
          position: 'relative',
          marginTop: 24,
          borderRadius: 24,
          padding: '18px 18px 16px',
          overflow: 'visible',
          isolation: 'isolate',
          background:
            'linear-gradient(145deg, rgba(94,55,49,0.94), rgba(117,72,63,0.86) 58%, rgba(94,55,49,0.90))',
          border: '1px solid rgba(255,230,184,0.30)',
          boxShadow: '0 16px 34px rgba(43,22,15,0.22), inset 0 1px 0 rgba(255,255,255,0.10)',
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
            borderRadius: 24,
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
                initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'block',
                  width: '100%',
                  minHeight: 'auto',
                  margin: i === 0 ? 0 : '14px 0 0',
                  padding: active ? '10px 12px 11px 18px' : '4px 0 4px 18px',
                  borderRadius: 16,
                  background: active ? 'rgba(255,255,255,0.055)' : 'transparent',
                  border: active ? '1px solid rgba(255,230,184,0.18)' : '1px solid transparent',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 'clamp(15px, 4.2vw, 17px)',
                  fontWeight: active ? 760 : 650,
                  lineHeight: 1.64,
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
                    top: active ? 9 : 7,
                    bottom: active ? 9 : 7,
                    width: active ? 4 : 2,
                    borderRadius: 999,
                    background: active ? 'linear-gradient(180deg, #fff1cf, #f37435)' : 'rgba(255,230,184,0.24)',
                    boxShadow: active ? '0 0 18px rgba(243,116,53,0.42)' : 'none',
                  }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {renderReadingText(p, highlights, active, active ? activeChar : 0)}
                </span>
              </motion.p>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {highlight && visibleCount >= paragraphs.length && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            marginTop: 20,
            borderLeft: '3px solid #f37435',
            background: 'rgba(94,55,49,0.92)',
            border: '1px solid var(--orange)',
            borderRadius: '0 16px 16px 0',
            padding: '14px 18px',
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
              lineHeight: 1.5,
            }}
          >
            "{highlight}"
          </p>
        </motion.div>
      )}
    </div>
  )
}
