import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundOn } from '@/lib/effects'
import { TopicIllustration } from './TopicIllustration'
import { useTheme } from '../context/ThemeContext'

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

/** Realça palavras (em laranja) dentro de um parágrafo. */
function renderWithHighlights(text: string, highlights: string[] = []) {
  if (highlights.length === 0) return text
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) =>
    highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
      <span key={i} className="font-semibold" style={{ color: 'var(--orange)' }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [visibleCount, setVisibleCount] = useState(0)
  const [narrating, setNarrating] = useState(true)
  const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

  // revela um parágrafo de cada vez (sem auto-scroll)
  useEffect(() => {
    setVisibleCount(0)
    const timers: number[] = []
    paragraphs.forEach((_, i) => {
      timers.push(window.setTimeout(() => setVisibleCount(i + 1), i * 1800 + 400))
    })
    return () => timers.forEach(clearTimeout)
  }, [paragraphs])

  // Lis narra o conteúdo em voz (Web Speech API) — respeita o toggle de som
  const startedRef = useRef(false)
  useEffect(() => {
    if (!supportsTTS || !isSoundOn()) return
    window.speechSynthesis.cancel()
    const fullText = [title, ...paragraphs, ...(highlight ? [highlight] : [])].join('. ')

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
      window.speechSynthesis.speak(utter)
      startedRef.current = true
      setNarrating(true)
    }

    // vozes podem não estar carregadas ainda (comportamento comum no Chrome mobile)
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
    if (narrating) window.speechSynthesis.pause()
    else window.speechSynthesis.resume()
    setNarrating((n) => !n)
  }

  return (
    <div
      className="relative flex h-full flex-col overflow-y-auto no-scrollbar px-6 pb-32 pt-10"
      style={{ background: isLight ? '#ffffff' : '#0d0800' }}
    >
      {/* header: (mute + tag) à esquerda, ilustração animada à direita */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 0 }}>
          {supportsTTS && (
            <button
              onClick={toggleNarration}
              aria-label={narrating ? 'Silenciar narração' : 'Ativar narração'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: isLight ? 'rgba(94,55,49,0.08)' : 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isLight ? 'rgba(184,134,11,0.25)' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              {narrating ? <Volume2 size={16} color={isLight ? '#5e3731' : '#e8cfa0'} /> : <VolumeX size={16} color={isLight ? 'rgba(94,55,49,0.4)' : 'rgba(232,207,160,0.4)'} />}
            </button>
          )}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <span className="tag-chip">{tag}</span>
          </motion.div>
        </div>

        <TopicIllustration tag={tag} accent={accent} size={88} />
      </div>

      {/* título */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          fontFamily: 'MadeByDillan, serif',
          fontSize: 'clamp(30px, 9vw, 42px)',
          color: isLight ? 'var(--text-primary)' : '#fff',
          lineHeight: 1.05,
          marginTop: 16,
          textShadow: isLight ? 'none' : '0 2px 20px rgba(0,0,0,0.5)',
        }}
      >
        {title}
      </motion.h2>

      {/* separador dourado */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          height: 2,
          width: 56,
          marginTop: 16,
          borderRadius: 999,
          transformOrigin: 'left',
          background: '#b8860b',
        }}
      />

      {/* barra de progresso de leitura (parágrafos revelados) */}
      <div style={{ height: 2, background: isLight ? 'rgba(94,55,49,0.12)' : 'rgba(255,255,255,0.08)', borderRadius: 999, marginTop: 16 }}>
        <motion.div
          animate={{ width: `${(visibleCount / Math.max(1, paragraphs.length)) * 100}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', borderRadius: 999, background: '#b8860b' }}
        />
      </div>

      {/* chips de conceitos (opcional) */}
      {keywords && keywords.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 18 }}>
          {keywords.map((kw) => (
            <span
              key={kw}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: 'rgba(184,134,11,0.12)',
                border: '1px solid rgba(184,134,11,0.28)',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: '#b8860b',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* parágrafos progressivos */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence>
          {paragraphs.slice(0, visibleCount).map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 16,
                lineHeight: 1.7,
                color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.90)',
              }}
            >
              {renderWithHighlights(p, highlights)}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* quote em destaque (após revelar tudo) */}
      {highlight && visibleCount >= paragraphs.length && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            marginTop: 24,
            borderLeft: '3px solid #f37435',
            background: isLight ? 'rgba(243,116,53,0.10)' : 'rgba(243,116,53,0.08)',
            borderRadius: '0 14px 14px 0',
            padding: '14px 18px',
          }}
        >
          <p
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 15,
              fontStyle: 'italic',
              fontWeight: 600,
              color: isLight ? '#c25324' : '#ff8f5a',
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
