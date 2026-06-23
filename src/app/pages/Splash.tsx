import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { getAdminData } from '@/lib/adminStore'
import { useTheme } from '../context/ThemeContext'
import { hasRequiredOnboarding } from '@/lib/onboarding'

export default function Splash() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const welcomeText = getAdminData().splashConfig.welcomeText

  useEffect(() => {
    const current = localStorage.getItem('pralis:current-employee')
    const id = setTimeout(() => {
      if (current) navigate(hasRequiredOnboarding(current) ? '/feed' : '/conheca?entry=1', { replace: true })
      else navigate('/login', { replace: true })
    }, 2800)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div
      className="app-shell items-center justify-center"
      style={{ background: 'var(--bg-base)', overflow: 'hidden' }}
    >
      {/* padrão de fundo oficial da marca */}
      <motion.img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: 250,
          right: -86,
          top: 96,
          opacity: isLight ? 0.04 : 0.055,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
        animate={{ y: [0, 14, 0], rotate: [-4, -1, -4] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          width: 170,
          left: -54,
          bottom: 104,
          opacity: isLight ? 0.035 : 0.05,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
        animate={{ y: [0, -10, 0], rotate: [6, 2, 6] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* logo vetorial branca — desce com spring */}
        <motion.img
          src={isLight ? brand.logoSVGPreta : brand.logoSVGBranca}
          alt="padaria pralís"
          initial={{ opacity: 0, y: -30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          style={{ width: 200, height: 'auto', filter: isLight ? 'none' : FILTER_WHITE }}
        />

        {/* Lis — vídeo 3D acenando (transparência nativa do MOV) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: 300, height: 'auto', position: 'relative', background: 'var(--bg-base)' }}
        >
          <video
            src="/intro-lis-tchau-alpha.webm"
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
          }}
        >
          {welcomeText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          style={{ display: 'flex', gap: 6, marginTop: -8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#b8860b', display: 'block' }}
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
