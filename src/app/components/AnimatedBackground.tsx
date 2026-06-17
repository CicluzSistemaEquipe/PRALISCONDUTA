import { motion } from 'framer-motion'
import { brand, FILTER_WHITE } from '@/lib/brand'
import { useTheme, type Theme } from '../context/ThemeContext'

export function AnimatedBackground({ theme }: { accent?: string; theme?: Theme }) {
  const ctx = useTheme()
  const isLight = (theme ?? ctx.theme) === 'light'

  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{ background: isLight ? '#ffffff' : '#5e3731' }}>
      <motion.img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{
          width: 260,
          right: -92,
          top: 92,
          opacity: isLight ? 0.045 : 0.055,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
        animate={{ y: [0, 14, 0], rotate: [-4, -1, -4], opacity: isLight ? [0.035, 0.05, 0.035] : [0.04, 0.06, 0.04] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{
          width: 190,
          left: -72,
          bottom: 118,
          opacity: isLight ? 0.04 : 0.052,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
        animate={{ y: [0, -12, 0], rotate: [6, 2, 6], opacity: isLight ? [0.03, 0.05, 0.03] : [0.035, 0.058, 0.035] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 18% 10%, rgba(243,116,53,0.08), transparent 30%), radial-gradient(circle at 88% 26%, rgba(184,134,11,0.08), transparent 34%)'
            : 'radial-gradient(circle at 18% 10%, rgba(243,116,53,0.18), transparent 30%), radial-gradient(circle at 88% 26%, rgba(184,134,11,0.16), transparent 34%)',
        }}
      />
    </div>
  )
}
