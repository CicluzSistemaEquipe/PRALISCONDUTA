import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Home } from 'lucide-react'
import { fireConfetti, soundComplete, hapticSuccess } from '@/lib/effects'
import { PralisSymbolX } from './PralisSymbol'
import { brand } from '@/lib/brand'

interface CompletionCardProps {
  badge: string
  message: string
  quizScore?: { correct: number; total: number }
  onBack: () => void
}

export function CompletionCard({ badge, message, quizScore, onBack }: CompletionCardProps) {
  useEffect(() => {
    fireConfetti(3000)
    soundComplete()
    hapticSuccess()
  }, [])

  const perfect = Boolean(quizScore && quizScore.total > 0 && quizScore.correct === quizScore.total)

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center overflow-hidden text-center"
      style={{ padding: '0 24px 120px 24px', gap: 22 }}
    >
      <motion.img
        aria-hidden="true"
        src={brand.simboloEspiga}
        className="pointer-events-none absolute"
        style={{
          width: 220,
          right: -72,
          top: 76,
          opacity: 0.05,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
        }}
        animate={{ y: [0, 12, 0], rotate: [-5, -1, -5], opacity: [0.04, 0.065, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        aria-hidden="true"
        src={brand.simboloPar}
        className="pointer-events-none absolute"
        style={{
          width: 170,
          left: -54,
          bottom: 120,
          opacity: 0.045,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
        }}
        animate={{ y: [0, -10, 0], rotate: [6, 2, 6], opacity: [0.035, 0.058, 0.035] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative"
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffffff 0%, #ffe6b8 100%)',
          boxShadow: '0 0 70px rgba(255,230,184,0.36), 0 18px 34px rgba(43,22,15,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.65)',
        }}
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.24)', '0 0 0 18px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <Trophy size={44} color="#b8860b" />
      </motion.div>

      <div
        className="relative px-4 py-2"
        style={{
          borderRadius: 22,
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.20)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          filter: 'drop-shadow(0 12px 22px rgba(43,22,15,0.24)) drop-shadow(0 0 18px rgba(255,230,184,0.18))',
        }}
      >
        <PralisSymbolX size={92} animate delay={0.3} />
      </div>

      <div className="relative">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.90)',
            fontWeight: 800,
          }}
        >
          Conquista desbloqueada
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ fontFamily: 'MadeByDillan, serif', fontSize: 'clamp(30px, 8vw, 38px)', color: '#fff', marginTop: 8, lineHeight: 1.05 }}
        >
          {badge}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(14px, 4vw, 16px)',
            color: 'rgba(255,255,255,0.88)',
            marginTop: 12,
            lineHeight: 1.55,
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
            background: perfect ? 'rgba(93,216,122,0.14)' : 'rgba(255,255,255,0.10)',
            border: `1px solid ${perfect ? 'rgba(93,216,122,0.42)' : 'rgba(255,255,255,0.18)'}`,
            borderRadius: 18,
            padding: '16px 28px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {quizScore.correct}/{quizScore.total}
          </p>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            {perfect ? 'Perfeito! Acertou tudo!' : 'acertos no quiz'}
          </p>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        onClick={onBack}
        className="btn-next-white w-full"
        style={{ marginTop: 8 }}
      >
        <span>Voltar ao início</span>
        <Home size={18} color="#f37435" />
      </motion.button>
    </div>
  )
}
