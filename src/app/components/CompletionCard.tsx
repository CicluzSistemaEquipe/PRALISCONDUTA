import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Home } from 'lucide-react'
import { fireConfetti, soundComplete, hapticSuccess } from '@/lib/effects'
import { PralisSymbolX } from './PralisSymbol'
import { useTheme } from '../context/ThemeContext'

interface CompletionCardProps {
  badge: string
  message: string
  quizScore?: { correct: number; total: number }
  onBack: () => void
}

export function CompletionCard({ badge, message, quizScore, onBack }: CompletionCardProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  useEffect(() => {
    fireConfetti(3000)
    soundComplete()
    hapticSuccess()
  }, [])

  const perfect = Boolean(quizScore && quizScore.total > 0 && quizScore.correct === quizScore.total)

  return (
    <div
      className="flex h-full flex-col items-center justify-center text-center"
      style={{ padding: '0 24px 120px 24px', gap: 24 }}
    >
      {/* troféu */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #b8860b, #f37435)',
          boxShadow: '0 0 60px rgba(184,134,11,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Trophy size={44} color="#fff" />
      </motion.div>

      {/* símbolo da marca em X */}
      <PralisSymbolX size={88} animate delay={0.3} />

      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#b8860b',
            fontWeight: 700,
          }}
        >
          Conquista desbloqueada
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ fontFamily: 'MadeByDillan, serif', fontSize: 32, color: isLight ? 'var(--text-primary)' : '#fff', marginTop: 8, lineHeight: 1.1 }}
        >
          {badge}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 16,
            color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.80)',
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          {message}
        </motion.p>
      </div>

      {quizScore && quizScore.total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            background: perfect ? 'rgba(74,222,128,0.08)' : 'rgba(184,134,11,0.08)',
            border: `1px solid ${perfect ? 'rgba(74,222,128,0.25)' : 'rgba(184,134,11,0.22)'}`,
            borderRadius: 16,
            padding: '16px 28px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'MadeByDillan, serif', fontSize: 28, color: isLight ? 'var(--text-primary)' : '#fff' }}>
            {quizScore.correct}/{quizScore.total}
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: isLight ? 'var(--text-secondary)' : 'rgba(232,207,160,0.65)', marginTop: 4 }}>
            {perfect ? '🎯 Perfeito! Acertou tudo!' : 'acertos no quiz'}
          </p>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        onClick={onBack}
        className="btn-laranja w-full"
        style={{ marginTop: 8 }}
      >
        Voltar ao início <Home size={18} />
      </motion.button>
    </div>
  )
}
