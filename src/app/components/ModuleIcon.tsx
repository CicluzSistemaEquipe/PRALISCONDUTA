import type { ModuleIconType } from '@/lib/types'

interface IconProps {
  color?: string
  size?: number
  className?: string
}

// SÍMBOLO 1 — Flor de 4 pétalas
function FlowerIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <ellipse cx="50" cy="22" rx="16" ry="28" fill={color} />
      <ellipse cx="50" cy="78" rx="16" ry="28" fill={color} />
      <ellipse cx="22" cy="50" rx="28" ry="16" fill={color} />
      <ellipse cx="78" cy="50" rx="28" ry="16" fill={color} />
      <circle cx="50" cy="50" r="10" fill={color} />
    </svg>
  )
}

// SÍMBOLO 2 — Broto de trigo (3 pares de folhas)
function SproutIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 100" fill="none" className={className} aria-hidden="true">
      <line x1="40" y1="90" x2="40" y2="15" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="25" cy="72" rx="18" ry="10" transform="rotate(-25 25 72)" fill={color} />
      <ellipse cx="55" cy="72" rx="18" ry="10" transform="rotate(25 55 72)" fill={color} />
      <ellipse cx="22" cy="52" rx="16" ry="9" transform="rotate(-20 22 52)" fill={color} />
      <ellipse cx="58" cy="52" rx="16" ry="9" transform="rotate(20 58 52)" fill={color} />
      <ellipse cx="32" cy="32" rx="12" ry="7" transform="rotate(-12 32 32)" fill={color} />
      <ellipse cx="48" cy="32" rx="12" ry="7" transform="rotate(12 48 32)" fill={color} />
    </svg>
  )
}

// SÍMBOLO 3 — Grão/bússola (círculo com 4 pétalas internas)
function GrainIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="4" />
      <ellipse cx="50" cy="28" rx="10" ry="22" fill={color} />
      <ellipse cx="50" cy="72" rx="10" ry="22" fill={color} />
      <ellipse cx="28" cy="50" rx="22" ry="10" fill={color} />
      <ellipse cx="72" cy="50" rx="22" ry="10" fill={color} />
    </svg>
  )
}

// SÍMBOLO 4 — Espiga completa de trigo (símbolo principal da Pralís)
function WheatIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none" className={className} aria-hidden="true">
      <line x1="50" y1="105" x2="50" y2="20" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="50" cy="18" rx="8" ry="12" fill={color} />
      <ellipse cx="33" cy="46" rx="15" ry="8" transform="rotate(-20 33 46)" fill={color} />
      <ellipse cx="67" cy="46" rx="15" ry="8" transform="rotate(20 67 46)" fill={color} />
      <ellipse cx="30" cy="70" rx="16" ry="9" transform="rotate(-30 30 70)" fill={color} />
      <ellipse cx="70" cy="70" rx="16" ry="9" transform="rotate(30 70 70)" fill={color} />
      <ellipse cx="35" cy="95" rx="16" ry="9" transform="rotate(-35 35 95)" fill={color} />
      <ellipse cx="65" cy="95" rx="16" ry="9" transform="rotate(35 65 95)" fill={color} />
    </svg>
  )
}

export function ModuleIcon({
  type,
  color,
  size,
  className,
}: {
  type: ModuleIconType
  color?: string
  size?: number
  className?: string
}) {
  switch (type) {
    case 'flower':
      return <FlowerIcon color={color} size={size} className={className} />
    case 'sprout':
      return <SproutIcon color={color} size={size} className={className} />
    case 'grain':
      return <GrainIcon color={color} size={size} className={className} />
    case 'wheat':
      return <WheatIcon color={color} size={size} className={className} />
  }
}
