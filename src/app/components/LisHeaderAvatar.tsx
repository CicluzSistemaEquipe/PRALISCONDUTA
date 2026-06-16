import lisBust from '@/assets/lis/lis-bust.png'

/**
 * Avatar da Lis com ring de progresso (estilo stories do Instagram).
 * O ring mostra o progresso global do colaborador.
 */
export function LisHeaderAvatar({
  globalProgress = 0,
  size = 44,
  onClick,
}: {
  globalProgress?: number
  size?: number
  onClick?: () => void
}) {
  const STROKE = 3
  const R = (size - STROKE * 2) / 2
  const C = 2 * Math.PI * R
  const offset = C - (Math.min(100, Math.max(0, globalProgress)) / 100) * C

  return (
    <button
      onClick={onClick}
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Progresso: ${Math.round(globalProgress)}%`}
    >
      <svg width={size} height={size} className="absolute left-0 top-0">
        <circle cx={size / 2} cy={size / 2} r={R} stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke="url(#ring-gradient)"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="100%" stopColor="#f37435" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className="absolute overflow-hidden rounded-full"
        style={{
          inset: STROKE + 2,
          background: 'linear-gradient(160deg, rgba(184,134,11,0.35), rgba(94,55,49,0.40))',
        }}
      >
        <img
          src={lisBust}
          alt="Lis"
          style={{ width: '115%', height: '115%', objectFit: 'cover', objectPosition: 'center 8%', marginLeft: '-7%', marginTop: '-2%' }}
        />
      </span>
    </button>
  )
}
