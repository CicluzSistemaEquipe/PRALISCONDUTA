import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { brand, FILTER_WHITE } from '@/lib/brand'

const VALUES = ['Qualidade', 'Respeito', 'Honestidade', 'Comprometimento', 'Humildade']

export function ValuesCard({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-6 pb-24 pt-14 text-center">
      <motion.img
        src={brand.symbolUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 230, filter: FILTER_WHITE, opacity: 0.08 }}
        animate={{ rotate: [0, 2, -2, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.img
        src={brand.simboloPar}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[-56px] top-24"
        style={{ width: 180, filter: FILTER_WHITE, opacity: 0.045 }}
        animate={{ y: [0, 10, 0], rotate: [-4, 0, -4] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <span className="tag-chip mx-auto">Nossos valores</span>
        <h2 className="mt-3 font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
          O que nos sustenta
        </h2>
      </motion.div>

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
        initial="initial"
        animate="animate"
        className="relative flex flex-wrap items-center justify-center gap-2.5"
      >
        {VALUES.map((v, i) => (
          <motion.span
            key={v}
            variants={{
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } },
            }}
            animate={{ y: [0, i % 2 === 0 ? -2 : 2, 0] }}
            transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-pill px-4 py-2 font-body text-sm font-bold uppercase tracking-wide"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(232,207,160,0.32)',
              color: 'var(--text-primary)',
              boxShadow: '0 10px 22px rgba(43,22,15,0.10)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {v}
          </motion.span>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onNext}
        className="btn-next-white relative w-full"
      >
        <span>Continuar</span>
        <ArrowRight className="h-5 w-5" color="#f37435" />
      </motion.button>
    </div>
  )
}
