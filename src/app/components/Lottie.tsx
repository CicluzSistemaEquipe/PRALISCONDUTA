import Lottie from 'lottie-react'

/**
 * Wrapper para animações Lottie (.json baixados de lottiefiles.com →
 * colocar em `src/assets/lottie/` e importar o JSON onde for usar).
 *
 *   import confetti from '@/assets/lottie/confetti-gold.json'
 *   <LottieFx data={confetti} loop={false} onComplete={...} />
 *
 * Enquanto não houver arquivos Lottie, o app usa o confetti em Canvas 2D
 * (lib/effects.ts → fireConfetti), que já está em uso nas conclusões.
 */
export function LottieFx({
  data,
  loop = true,
  size,
  fullscreen,
  onComplete,
}: {
  data: unknown
  loop?: boolean
  size?: number
  fullscreen?: boolean
  onComplete?: () => void
}) {
  if (!data) return null
  const style = fullscreen
    ? ({ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' } as const)
    : ({ width: size ?? 80, height: size ?? 80 } as const)
  return (
    <Lottie
      animationData={data as object}
      loop={loop}
      onComplete={onComplete}
      style={style}
    />
  )
}
