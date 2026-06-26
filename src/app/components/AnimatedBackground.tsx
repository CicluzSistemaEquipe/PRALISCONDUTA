import { brand, FILTER_WHITE } from '@/lib/brand'
import { useTheme, type Theme } from '../context/ThemeContext'

/**
 * Fundo da marca — leve e estático (sem loops infinitos).
 * As espigas ficam fixas como textura; só o gradiente sutil dá profundidade.
 * Decisão de performance: telas do colaborador precisam rodar fluido em
 * qualquer celular, então o fundo não anima (era a maior fonte de repaint).
 */
export function AnimatedBackground({ theme }: { accent?: string; theme?: Theme }) {
  const ctx = useTheme()
  const isLight = (theme ?? ctx.theme) === 'light'

  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'var(--bg-base)' }}>
      <img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{
          width: 260,
          right: -92,
          top: 92,
          opacity: isLight ? 0.04 : 0.05,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
      />
      <img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{
          width: 190,
          left: -72,
          bottom: 118,
          opacity: isLight ? 0.035 : 0.048,
          filter: isLight ? 'none' : FILTER_WHITE,
          mixBlendMode: isLight ? 'multiply' : 'screen',
        }}
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
