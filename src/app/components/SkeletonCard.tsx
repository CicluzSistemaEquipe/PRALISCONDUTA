import { motion } from 'framer-motion'

/** Placeholder pulsante (dourado) enquanto os dados carregam. */
export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className="rounded-3xl"
      style={{ height, background: 'rgba(184,134,11,0.08)' }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
    />
  )
}
