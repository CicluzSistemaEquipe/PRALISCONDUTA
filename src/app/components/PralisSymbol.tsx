import { motion } from 'framer-motion'

interface PralisSymbolProps {
  size?: number
  colorA?: string
  colorB?: string
  animate?: boolean
  delay?: number
}

const EASE = [0.43, 0.13, 0.23, 0.96] as [number, number, number, number]

/** Par de folhas da marca (Símbolo 2) com draw-in real via pathLength. */
export function PralisSymbol({
  size = 64,
  colorA = '#b8860b',
  colorB = '#f37435',
  animate = true,
  delay = 0,
}: PralisSymbolProps) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0, fillOpacity: 0 },
    visible: (d: number) => ({
      pathLength: 1,
      opacity: 1,
      fillOpacity: 1,
      transition: {
        pathLength: { duration: 0.9, delay: delay + d, ease: EASE },
        opacity: { duration: 0.1, delay: delay + d },
        fillOpacity: { duration: 0.4, delay: delay + d + 0.5 },
      },
    }),
  }

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      initial={animate ? 'hidden' : false}
      animate="visible"
    >
      <motion.path
        d="M116.49,109.56c-2.9-15.75-8.02-26.57-20.46-36.91-9.95-8.36-17.97-11.07-30.28-13.29-5.39-.98-7.05,1.72-6.36,7.14,1.66,16.48,11.2,28.79,20.46,37.15,7.47,6.4,19.5,11.81,30.28,13.04,5.67.74,7.33-1.97,6.36-7.14"
        fill={colorA}
        stroke={colorA}
        strokeWidth="0"
        fillRule="evenodd"
        variants={pathVariants}
        custom={0}
      />
      <motion.path
        d="M109.56.26c-15.75,2.9-26.57,8.02-36.91,20.46-8.36,9.95-11.07,17.97-13.29,30.28-.98,5.39,1.72,7.05,7.14,6.36,16.48-1.66,28.79-11.2,37.15-20.46,6.4-7.47,11.81-19.5,13.04-30.28.74-5.67-1.97-7.33-7.14-6.36"
        fill={colorB}
        stroke={colorB}
        strokeWidth="0"
        fillRule="evenodd"
        variants={pathVariants}
        custom={0.15}
      />
    </motion.svg>
  )
}

/** Trio de símbolos em X (ouro + laranja + marrom) — celebração. */
export function PralisSymbolX({
  size = 80,
  animate = true,
  delay = 0,
}: Omit<PralisSymbolProps, 'colorA' | 'colorB'>) {
  const colors = { ouro: '#b8860b', laranja: '#f37435', marrom: '#5e3731' }
  const group = (d: number) => ({
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: delay + d, type: 'spring' as const, stiffness: 200, damping: 18 },
    },
  })

  return (
    <motion.svg
      width={size}
      height={(size * 118.6) / 427.22}
      viewBox="0 0 427.22 118.6"
      fill="none"
      aria-hidden="true"
      initial={animate ? 'hidden' : false}
      animate="visible"
    >
      <motion.g variants={group(0)}>
        <path fill={colors.ouro} fillRule="evenodd" d="M116.49,109.56c-2.9-15.75-8.02-26.57-20.46-36.91-9.95-8.36-17.97-11.07-30.28-13.29-5.39-.98-7.05,1.72-6.36,7.14,1.66,16.48,11.2,28.79,20.46,37.15,7.47,6.4,19.5,11.81,30.28,13.04,5.67.74,7.33-1.97,6.36-7.14" />
        <path fill={colors.ouro} fillRule="evenodd" d="M109.56.26c-15.75,2.9-26.57,8.02-36.91,20.46-8.36,9.95-11.07,17.97-13.29,30.28-.98,5.39,1.72,7.05,7.14,6.36,16.48-1.66,28.79-11.2,37.15-20.46,6.4-7.47,11.81-19.5,13.04-30.28.74-5.67-1.97-7.33-7.14-6.36" />
        <path fill={colors.ouro} fillRule="evenodd" d="M.33,7.26c2.9,15.75,8.02,26.57,20.46,36.91,9.95,8.36,17.97,11.07,30.28,13.29,5.39.98,7.05-1.72,6.36-7.14-1.66-16.48-11.2-28.79-20.46-37.15C29.5,6.76,17.47,1.35,6.69.12,1.02-.62-.64,2.09.33,7.26" />
        <path fill={colors.ouro} fillRule="evenodd" d="M7.26,116.55c15.75-2.9,26.57-8.02,36.91-20.46,8.36-9.95,11.07-17.97,13.29-30.28.98-5.39-1.72-7.05-7.14-6.36-16.48,1.66-28.79,11.2-37.15,20.46C6.76,87.38,1.35,99.41.12,110.19c-.74,5.67,1.97,7.33,7.14,6.36" />
      </motion.g>
      <motion.g variants={group(0.1)}>
        <path fill={colors.laranja} fillRule="evenodd" d="M276.18,110.45c-2.9-15.75-8.02-26.57-20.46-36.91-9.95-8.36-17.97-11.07-30.28-13.29-5.39-.98-7.05,1.72-6.36,7.14,1.66,16.48,11.2,28.79,20.46,37.15,7.47,6.4,19.5,11.81,30.28,13.04,5.67.74,7.33-1.97,6.36-7.14" />
        <path fill={colors.laranja} fillRule="evenodd" d="M269.25,1.15c-15.75,2.9-26.57,8.02-36.91,20.46-8.36,9.95-11.07,17.97-13.29,30.28-.98,5.39,1.72,7.05,7.14,6.36,16.48-1.66,28.79-11.2,37.15-20.46,6.4-7.47,11.81-19.5,13.04-30.28.74-5.67-1.97-7.33-7.14-6.36" />
        <path fill={colors.laranja} fillRule="evenodd" d="M160.02,8.15c2.9,15.75,8.02,26.57,20.46,36.91,9.95,8.36,17.97,11.07,30.28,13.29,5.39.98,7.05-1.72,6.36-7.14-1.66-16.48-11.2-28.79-20.46-37.15-7.47-6.4-19.5-11.81-30.28-13.04-5.67-.74-7.33,1.97-6.36,7.14" />
        <path fill={colors.laranja} fillRule="evenodd" d="M166.95,117.45c15.75-2.9,26.57-8.02,36.91-20.46,8.36-9.95,11.07-17.97,13.29-30.28.98-5.39-1.72-7.05-7.14-6.36-16.48,1.66-28.79,11.2-37.15,20.46-6.4,7.47-11.81,19.5-13.04,30.28-.74,5.67,1.97,7.33,7.14,6.36" />
      </motion.g>
      <motion.g variants={group(0.2)}>
        <path fill={colors.marrom} fillRule="evenodd" d="M426.89,111.34c-2.9-15.75-8.02-26.57-20.46-36.91-9.95-8.36-17.97-11.07-30.28-13.29-5.39-.98-7.05,1.72-6.36,7.14,1.66,16.48,11.2,28.79,20.46,37.15,7.47,6.4,19.5,11.81,30.28,13.04,5.67.74,7.33-1.97,6.36-7.14" />
        <path fill={colors.marrom} fillRule="evenodd" d="M419.96,2.05c-15.75,2.9-26.57,8.02-36.91,20.46-8.36,9.95-11.07,17.97-13.29,30.28-.98,5.39,1.72,7.05,7.14,6.36,16.48-1.66,28.79-11.2,37.15-20.46,6.4-7.47,11.81-19.5,13.04-30.28.74-5.67-1.97-7.33-7.14-6.36" />
        <path fill={colors.marrom} fillRule="evenodd" d="M310.73,9.04c2.9,15.75,8.02,26.57,20.46,36.91,9.95,8.36,17.97,11.07,30.28,13.29,5.39.98,7.05-1.72,6.36-7.14-1.66-16.48-11.2-28.79-20.46-37.15-7.47-6.4-19.5-11.81-30.28-13.04-5.67-.74-7.33,1.97-6.36,7.14" />
        <path fill={colors.marrom} fillRule="evenodd" d="M317.66,118.34c15.75-2.9,26.57-8.02,36.91-20.46,8.36-9.95,11.07-17.97,13.29-30.28.98-5.39-1.72-7.05-7.14-6.36-16.48,1.66-28.79,11.2-37.15,20.46-6.4,7.47-11.81,19.5-13.04,30.28-.74,5.67,1.97,7.33,7.14,6.36" />
      </motion.g>
    </motion.svg>
  )
}
