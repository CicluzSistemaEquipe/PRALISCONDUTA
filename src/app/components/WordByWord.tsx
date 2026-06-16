import { motion } from 'framer-motion'

/**
 * Texto que aparece palavra por palavra (stagger). Palavras em `highlights`
 * surgem em laranja com leve scale.
 */
export function WordByWord({
  text,
  highlights = [],
  className,
  delay = 0,
}: {
  text: string
  highlights?: string[]
  className?: string
  delay?: number
}) {
  const words = text.split(' ')
  const lower = highlights.map((h) => h.toLowerCase())

  return (
    <motion.p
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.04, delayChildren: delay } } }}
    >
      {words.map((word, i) => {
        const clean = word.replace(/[.,;:!?]/g, '').toLowerCase()
        const hot = lower.includes(clean)
        return (
          <motion.span
            key={i}
            className="inline-block"
            style={{ marginRight: '0.28em', color: hot ? 'var(--orange)' : undefined, fontWeight: hot ? 600 : undefined }}
            variants={{
              hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
              visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            {word}
          </motion.span>
        )
      })}
    </motion.p>
  )
}
