import { motion } from 'framer-motion'
import { BookOpen, Check } from 'lucide-react'

interface SummaryCardProps {
  title: string
  bullets: string[]
  onNext?: () => void
}

export function SummaryCard({ title, bullets }: SummaryCardProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-4 px-5 pb-28 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="flex min-w-0 items-center gap-3"
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: '#6a4038',
            border: '1.5px solid #e8cfa0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BookOpen size={24} color="#e8cfa0" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            className="font-body uppercase"
            style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', color: '#ffe6b8' }}
          >
            resumo do modulo
          </p>
          <h2
            style={{
              fontFamily: 'MadeByDillan, serif',
              fontSize: 'clamp(24px, 7vw, 31px)',
              color: '#ffffff',
              lineHeight: 1.02,
              overflowWrap: 'anywhere',
            }}
          >
            {title}
          </h2>
        </div>
      </motion.div>

      <div className="flex flex-col gap-2.5">
        {bullets.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -18, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.16 + i * 0.14, type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: '#6a4038',
              border: '1.5px solid #d8a24d',
              borderRadius: 16,
              padding: '12px 13px',
              boxShadow: '0 8px 18px rgba(43,22,15,0.12)',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 10,
                background: '#f37435',
                border: '1px solid #ffe6b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                color: '#ffffff',
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(13px, 3.8vw, 15px)',
                fontWeight: 700,
                lineHeight: 1.42,
                color: '#ffffff',
                overflowWrap: 'anywhere',
                hyphens: 'auto',
              }}
            >
              {b}
            </span>
            <Check size={17} color="#5dd87a" style={{ marginTop: 3, flexShrink: 0 }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
