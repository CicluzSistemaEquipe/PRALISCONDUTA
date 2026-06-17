import { motion } from 'framer-motion'
import { brand } from '@/lib/brand'
import { useTheme, type Theme } from '../context/ThemeContext'

/**
 * Fundo Pralís — 2 camadas: um gradiente base quente (glow do módulo +
 * glows de canto) e o padrão de espigas em drift lento.
 *
 * Adapta-se ao tema (dark/light) mantendo TODAS as animações idênticas —
 * muda apenas cores e opacidades. `theme` permite forçar um tema (ex.: o
 * login do admin, que permanece sempre dark).
 */
export function AnimatedBackground({ theme }: { accent?: string; theme?: Theme }) {
  const ctx = useTheme()
  const isLight = (theme ?? ctx.theme) === 'light'

  return (
    <>
      {/* 1 — base sólida quente */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: isLight ? '#fdf8f2' : '#150900' }}
      />

      {/* 2 — padrão de espigas — apenas no light mode, muito sutil */}
      {isLight && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 motion-reduce:animate-none"
          style={{
            backgroundImage: `url(${brand.patternBrand})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '140px 140px',
            opacity: 0.03,
            filter: 'brightness(0) saturate(0%)',
          }}
          animate={{ backgroundPosition: ['0px 0px', '140px 140px'] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </>
  )
}
