import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { slideFromLeft, staggerChildren } from '@/lib/animations'
interface SummaryCardProps {
  title: string
  bullets: string[]
  /** mantido por compatibilidade — o avanço é feito pela seta global do StoryPlayer */
  onNext?: () => void
}

export function SummaryCard({ title, bullets }: SummaryCardProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-5 px-6 pb-24 pt-12">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={24} color="#fff" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'MadeByDillan, serif', fontSize: 28, color: '#fff', lineHeight: 1.1 }}
      >
        {title}
      </motion.h2>

      <motion.ul variants={staggerChildren} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
        {bullets.map((b, i) => (
          <motion.li
            key={i}
            variants={slideFromLeft}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: 14,
              padding: '12px 14px',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 22,
                height: 22,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.20)',
                border: '1px solid rgba(255,255,255,0.30)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.90)' }}>
              {b}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
