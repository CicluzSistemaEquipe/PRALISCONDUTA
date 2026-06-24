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

// SÍMBOLO 5 — Pão (forma de pão)
function BreadIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 80" fill="none" className={className} aria-hidden="true">
      <path d="M10,55 Q8,10 50,10 Q92,10 90,55 Z" fill={color} />
      <rect x="10" y="52" width="80" height="18" rx="7" fill={color} />
    </svg>
  )
}

// SÍMBOLO 6 — Croissant
function CroissantIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <path d="M18,78 Q2,48 22,20 Q32,46 50,52 Q68,46 78,20 Q98,48 82,78 Q66,54 50,58 Q34,54 18,78 Z" fill={color} />
    </svg>
  )
}

// SÍMBOLO 7 — Bolo com vela
function CakeIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <rect x="15" y="55" width="70" height="35" rx="8" fill={color} />
      <ellipse cx="50" cy="55" rx="35" ry="9" fill={color} />
      <rect x="44" y="30" width="12" height="25" rx="5" fill={color} />
      <ellipse cx="50" cy="24" rx="6" ry="9" fill={color} />
    </svg>
  )
}

// SÍMBOLO 8 — Estrela
function StarIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} />
    </svg>
  )
}

// SÍMBOLO 9 — Coração
function HeartIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 90" fill="none" className={className} aria-hidden="true">
      <path d="M50,82 Q8,56 8,30 Q8,8 30,8 Q41,8 50,24 Q59,8 70,8 Q92,8 92,30 Q92,56 50,82 Z" fill={color} />
    </svg>
  )
}

// SÍMBOLO 10 — Chapéu de chef
function ChefIcon({ color = 'currentColor', size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <rect x="20" y="68" width="60" height="14" rx="4" fill={color} />
      <path d="M28,68 Q26,38 50,32 Q74,38 72,68 Z" fill={color} />
      <circle cx="50" cy="30" r="22" fill={color} />
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
    case 'bread':
      return <BreadIcon color={color} size={size} className={className} />
    case 'croissant':
      return <CroissantIcon color={color} size={size} className={className} />
    case 'cake':
      return <CakeIcon color={color} size={size} className={className} />
    case 'star':
      return <StarIcon color={color} size={size} className={className} />
    case 'heart':
      return <HeartIcon color={color} size={size} className={className} />
    case 'chef':
      return <ChefIcon color={color} size={size} className={className} />
  }
}
