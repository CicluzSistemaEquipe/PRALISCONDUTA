import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { fireConfetti, soundComplete, hapticSuccess } from '@/lib/effects'
import { PralisSymbolX } from './PralisSymbol'
import { brand } from '@/lib/brand'

interface CompletionCardProps {
  badge: string
  message: string
  quizScore?: { correct: number; total: number }
  onBack: () => void
  onNextModule?: () => void
}

export function CompletionCard({ badge, message, quizScore, onBack, onNextModule }: CompletionCardProps) {
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
      {/* patterns de fundo com máscara para sumir a borda */}
      <motion.img
        aria-hidden="true"
        src={brand.simboloEspiga}
        className="pointer-events-none absolute"
        style={{
          width: 220,
          right: -72,
          top: 76,
          opacity: 0.055,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
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
          opacity: 0.048,
          filter: 'brightness(0) invert(1)',
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)',
        }}
        animate={{ y: [0, -10, 0], rotate: [6, 2, 6], opacity: [0.035, 0.058, 0.035] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Lis comemorando — dentro do círculo com fade na base */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 }}
        style={{ position: 'relative', width: 160, height: 210, flexShrink: 0 }}
      >
        {/* pulso atrás de tudo */}
        <motion.div
          style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 128, height: 128, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.38)',
            zIndex: 0, pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.55, 1.55], opacity: [0.45, 0, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* círculo base — atrás da Lis */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 128, height: 128, borderRadius: '50%',
          background: 'linear-gradient(160deg, #ffffff 0%, #ffe6b8 100%)',
          border: '3px solid rgba(184,134,11,0.55)',
          boxShadow: '0 0 40px rgba(255,230,184,0.50), 0 0 0 6px rgba(184,134,11,0.15)',
          zIndex: 1,
        }} />

        {/* vídeo da Lis — dentro/sobre o círculo, mostrando do busto pra cima */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 4, left: 0, right: 0,
            height: 205, zIndex: 2, pointerEvents: 'none',
          }}
        >
          <video
            src="/video-final-lis-feliz-alpha.webm"
            autoPlay loop muted playsInline
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 5%',  /* ancora no topo — mostra cabeça/busto */
            }}
          />
        </motion.div>

        {/* fade circular na base — busto dela "dissolve" no círculo */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 128, height: 128, borderRadius: '50%',
          background: 'linear-gradient(to bottom, transparent 15%, rgba(255,230,184,0.7) 60%, #ffe0a0 100%)',
          zIndex: 3, pointerEvents: 'none',
        }} />
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
        {onNextModule && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 200, damping: 20 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNextModule}
            className="w-full"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 20px', borderRadius: 999,
              background: 'linear-gradient(110deg, #f37435 0%, #f37435 45%, #b8860b 100%)',
              border: '1px solid rgba(255,255,255,0.30)',
              boxShadow: '0 12px 28px rgba(43,22,15,0.22)',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 15, fontWeight: 800, color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <span>Próximo módulo</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.button>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: onNextModule ? 1.15 : 1.0 }}
          onClick={onBack}
          className="btn-next-white w-full"
        >
          <span>Voltar ao início</span>
          <Home size={18} color="#f37435" />
        </motion.button>
      </div>
    </div>
  )
}
