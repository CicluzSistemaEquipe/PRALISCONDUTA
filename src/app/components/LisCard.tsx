import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { LisState } from '@/lib/types'
import { LisAvatar } from './LisAvatar'
import { useTheme } from '../context/ThemeContext'

interface LisCardProps {
  text: string
  state?: LisState
  onNext: () => void
  isLast?: boolean
}

/** Fala da Lis com efeito de digitação + cursor piscando. */
export function LisCard({ text, state = 'talking', onNext, isLast }: LisCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setShown('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 22)
    return () => clearInterval(id)
  }, [text])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 pb-24 pt-10 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <LisAvatar state={state} size={120} />
      </motion.div>

      <div
        className="relative min-h-[110px] w-full"
        style={{
          background: isLight ? 'rgba(255,248,235,0.85)' : 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184,134,11,0.25)',
          borderRadius: '6px 20px 20px 20px',
          padding: '18px 20px',
        }}
      >
        {/* ponteiro do balão */}
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid rgba(184,134,11,0.25)',
          }}
        />
        <p
          className="leading-relaxed"
          style={{ fontFamily: 'Montserrat, sans-serif', fontStyle: 'italic', fontSize: 17, color: isLight ? 'var(--text-primary)' : '#e8cfa0' }}
        >
          {shown}
          {!done && <span className="ml-0.5 inline-block animate-cursor-blink">|</span>}
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
        onClick={onNext}
        className="btn-laranja w-full"
        disabled={!done}
      >
        {isLast ? 'Concluir' : 'Próximo'} <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
