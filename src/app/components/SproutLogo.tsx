import { motion } from 'framer-motion'

interface SproutLogoProps {
  size?: number
  /** anima a entrada (splash/loading) */
  animate?: boolean
  className?: string
}

// Espiga de trigo oficial da Pralís (src/assets/brand/simbolo-pralis.svg),
// recriada com <motion> para animar grão a grão e colorir via tema.
const GRAINS = [
  { cx: 33, cy: 46, rx: 15, ry: 8, rot: -20, color: 'var(--pralis-ouro)', d: 0.12 },
  { cx: 67, cy: 46, rx: 15, ry: 8, rot: 20, color: 'var(--pralis-ouro)', d: 0.18 },
  { cx: 30, cy: 70, rx: 16, ry: 9, rot: -30, color: 'var(--pralis-laranja)', d: 0.24 },
  { cx: 70, cy: 70, rx: 16, ry: 9, rot: 30, color: 'var(--pralis-laranja)', d: 0.3 },
  { cx: 35, cy: 95, rx: 16, ry: 9, rot: -35, color: 'var(--pralis-ouro-lt)', d: 0.36 },
  { cx: 65, cy: 95, rx: 16, ry: 9, rot: 35, color: 'var(--pralis-ouro-lt)', d: 0.42 },
]

export function SproutLogo({ size = 64, animate = false, className }: SproutLogoProps) {
  const h = (size * 130) / 100
  return (
    <motion.svg
      width={size}
      height={h}
      viewBox="0 0 100 130"
      fill="none"
      className={className}
      initial={animate ? 'hidden' : false}
      animate="visible"
      aria-hidden="true"
    >
      {/* caule */}
      <motion.line
        x1="50"
        y1="105"
        x2="50"
        y2="20"
        stroke="var(--pralis-laranja)"
        strokeWidth="4"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        }}
      />
      {/* grão do topo */}
      <motion.ellipse
        cx="50"
        cy="18"
        rx="8"
        ry="12"
        fill="var(--pralis-laranja)"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { delay: 0.5, duration: 0.35, ease: 'backOut' } },
        }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      {/* pares de grãos */}
      {GRAINS.map((g, i) => (
        <motion.ellipse
          key={i}
          cx={g.cx}
          cy={g.cy}
          rx={g.rx}
          ry={g.ry}
          fill={g.color}
          transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: { delay: g.d, duration: 0.3, ease: 'backOut' },
            },
          }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}
    </motion.svg>
  )
}

/** Logotipo textual "pralís" com o broto no lugar do acento. */
export function PralisWordmark({
  className,
  size = 'text-3xl',
}: {
  className?: string
  size?: string
}) {
  return (
    <span
      className={`font-display font-bold lowercase tracking-tight text-pralis-laranja ${size} ${className ?? ''}`}
    >
      pralís
    </span>
  )
}
