import { brand, FILTER_WHITE } from '@/lib/brand'
import { useTheme, type Theme } from '../context/ThemeContext'

/**
 * Fundo da marca — leve e estático (roda fluido em qualquer dispositivo).
 * Sem animação e sem mix-blend-mode (era uma camada de composição extra cara
 * em celular fraco): só duas espigas de baixa opacidade + um gradiente suave
 * nas cores da marca.
 */
export function AnimatedBackground({ theme }: { accent?: string; theme?: Theme }) {
  const ctx = useTheme()
  const isLight = (theme ?? ctx.theme) === 'light'

  return (
    <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'var(--bg-base)' }}>
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? 'radial-gradient(120% 80% at 20% 0%, rgba(243,116,53,0.06), transparent 46%), radial-gradient(110% 70% at 90% 18%, rgba(184,134,11,0.05), transparent 50%)'
            : 'radial-gradient(120% 80% at 20% 0%, rgba(243,116,53,0.12), transparent 46%), radial-gradient(110% 70% at 90% 18%, rgba(184,134,11,0.10), transparent 50%)',
        }}
      />
      <img
        src={brand.simboloEspiga}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{ width: 240, right: -88, top: 96, opacity: isLight ? 0.035 : 0.045, filter: isLight ? 'none' : FILTER_WHITE }}
      />
      <img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="absolute"
        style={{ width: 170, left: -64, bottom: 130, opacity: isLight ? 0.03 : 0.04, filter: isLight ? 'none' : FILTER_WHITE }}
      />
    </div>
  )
}
