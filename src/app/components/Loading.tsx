import { SproutLogo } from './SproutLogo'

export function Loading() {
  return (
    <div className="app-shell items-center justify-center bg-pralis-radial">
      <SproutLogo size={72} className="animate-pulse-soft" />
    </div>
  )
}
