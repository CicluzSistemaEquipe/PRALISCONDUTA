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
  const STROKE = Math.max(3, Math.round(size * 0.075))
  const R = (size - STROKE * 2) / 2
  const C = 2 * Math.PI * R
  const offset = C - (Math.min(100, Math.max(0, globalProgress)) / 100) * C

  return (
    <button
      onClick={onClick}
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        boxShadow: '0 10px 24px rgba(43,22,15,0.20)',
      }}
      aria-label={`Progresso: ${Math.round(globalProgress)}%`}
    >
      <svg width={size} height={size} className="absolute left-0 top-0">
        <circle cx={size / 2} cy={size / 2} r={R} stroke="rgba(255,255,255,0.22)" strokeWidth={STROKE} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          stroke="#f37435"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute overflow-hidden rounded-full"
        style={{
          inset: STROKE + 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,230,184,0.82))',
          border: '1px solid rgba(255,255,255,0.55)',
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
