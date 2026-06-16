import type { Variants, Transition } from 'framer-motion'

export const spring: Transition = { type: 'spring', stiffness: 300, damping: 30 }
export const softSpring: Transition = { type: 'spring', stiffness: 180, damping: 22 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: spring },
}

export const scaleHighlight: Variants = {
  hidden: { scale: 0.8, opacity: 0, color: 'var(--pralis-creme)' },
  visible: {
    scale: 1,
    opacity: 1,
    color: 'var(--pralis-laranja)',
    transition: { duration: 0.4, ease: 'backOut' },
  },
}

// transição entre stories (slide horizontal com spring)
export const storyTransition = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0.6 }),
  center: { x: 0, opacity: 1, transition: spring },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0.6, transition: spring }),
}

// transição entre módulos (fade + scale)
export const moduleTransition: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.25 } },
}
