import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { LisState } from '@/lib/types'
import { LisAvatar } from './LisAvatar'
import { brand } from '@/lib/brand'

interface LisCardProps {
  text: string
  state?: LisState
  onNext: () => void
  isLast?: boolean
}

export function LisCard({ text, state = 'talking', onNext, isLast }: LisCardProps) {
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
    <div className="relative flex h-full flex-col items-center justify-center gap-4 px-5 pb-24 pt-8 text-center">
      <motion.img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-16"
        style={{ width: 84, opacity: 0.08, filter: 'brightness(0) invert(1)' }}
        animate={{ y: [0, 8, 0], opacity: [0.06, 0.11, 0.06] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={{ scale: { type: 'spring', stiffness: 200, damping: 18 }, opacity: { duration: 0.25 }, y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <LisAvatar state={state} size={112} />
      </motion.div>

      <div
        className="relative w-full no-scrollbar"
        style={{
          minHeight: 112,
          maxHeight: '38vh',
          overflowY: 'auto',
          background: 'rgba(106,64,56,0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(232,207,160,0.26)',
          borderRadius: '10px 22px 22px 22px',
          padding: '16px 18px',
          boxShadow: '0 14px 32px rgba(43,22,15,0.16)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: 0,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid rgba(232,207,160,0.32)',
          }}
        />
        <p
          className="leading-relaxed"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontStyle: 'italic',
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: '#ffffff',
            overflowWrap: 'anywhere',
            wordBreak: 'normal',
            hyphens: 'auto',
          }}
        >
          {shown}
          {!done && <span className="ml-0.5 inline-block animate-cursor-blink">|</span>}
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
        onClick={onNext}
        className="btn-next-white w-full"
        disabled={!done}
      >
        <span>{isLast ? 'Concluir' : 'Próximo'}</span>
        <ArrowRight className="h-5 w-5" color="#f37435" />
      </motion.button>
    </div>
  )
}
