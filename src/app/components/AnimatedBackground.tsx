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
export function AnimatedBackground({ accent, theme }: { accent?: string; theme?: Theme }) {
  const ctx = useTheme()
  const isLight = (theme ?? ctx.theme) === 'light'
  const a = accent ?? '#b8860b'

  return (
    <>
      {/* 1 — gradiente base quente */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: isLight
            ? `
              radial-gradient(ellipse 80% 55% at 50% -5%, ${a}26 0%, transparent 60%),
              radial-gradient(ellipse 50% 35% at 100% 100%, rgba(243,116,53,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 40% 28% at 0% 100%, rgba(184,134,11,0.06) 0%, transparent 55%),
              #fdf6ec
            `
            : `
              radial-gradient(ellipse 80% 55% at 50% -5%, ${a}40 0%, transparent 60%),
              radial-gradient(ellipse 50% 35% at 100% 100%, rgba(243,116,53,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 40% 28% at 0% 100%, rgba(184,134,11,0.10) 0%, transparent 55%),
              #0d0800
            `,
        }}
      />

      {/* 2 — padrão de espigas (drift idêntico, opacidade/contraste por tema) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 motion-reduce:animate-none"
        style={{
          backgroundImage: `url(${brand.patternBrand})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '88px 88px',
          opacity: isLight ? 0.05 : 0.07,
          filter: isLight ? 'brightness(0) saturate(100%) opacity(0.6)' : 'none',
        }}
        animate={{ backgroundPosition: ['0px 0px', '88px 88px'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
    </>
  )
}
