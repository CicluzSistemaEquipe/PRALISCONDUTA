import { motion } from 'framer-motion'

interface StoryProgressBarProps {
  total: number
  current: number
  /** fração 0..1 preenchida do segmento atual */
  fraction: number
}

export function StoryProgressBar({ total, current, fraction }: StoryProgressBarProps) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '0 4px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.20)',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 999,
              background:
                i < current
                  ? '#fff'
                  : i === current
                    ? 'linear-gradient(90deg, #b8860b, #f37435)'
                    : 'transparent',
            }}
            animate={{ width: i < current ? '100%' : i === current ? `${fraction * 100}%` : '0%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  )
}
