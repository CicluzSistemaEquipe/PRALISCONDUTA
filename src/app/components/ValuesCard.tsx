import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { brand, FILTER_WHITE } from '@/lib/brand'

const VALUES = ['Qualidade', 'Respeito', 'Honestidade', 'Comprometimento', 'Humildade']

export function ValuesCard({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 pb-24 pt-14 text-center">
      {/* símbolo grande ao fundo, baixa opacidade */}
      <img
        src={brand.symbolUrl}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 220, filter: FILTER_WHITE, opacity: 0.06 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <span className="tag-chip mx-auto">Nossos valores</span>
        <h2 className="mt-3 font-display text-3xl text-white">O que nos sustenta</h2>
      </motion.div>

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}
        initial="initial"
        animate="animate"
        className="relative flex flex-wrap items-center justify-center gap-2.5"
      >
        {VALUES.map((v) => (
          <motion.span
            key={v}
            variants={{
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } },
            }}
            className="rounded-pill px-4 py-2 font-body text-sm font-bold uppercase tracking-wide"
            style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)', color: 'var(--cream)' }}
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
        className="btn-laranja relative w-full"
      >
        Continuar <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
