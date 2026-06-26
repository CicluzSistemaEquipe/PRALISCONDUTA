import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, BarChart3 } from 'lucide-react'

interface PollCardProps {
  question: string
  options: string[]
  allowMultiple?: boolean
  accent: string
  onAnswer: (selected: string[]) => void
  onNext: () => void
}

/**
 * Enquete — coleta a opinião do colaborador (sem certo/errado).
 * Visual coerente com os demais cards de story (fundo escuro do módulo,
 * texto claro, acento do módulo). Não bloqueia: avança após confirmar.
 */
export function PollCard({ question, options, allowMultiple = false, accent, onAnswer, onNext }: PollCardProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const toggle = (opt: string) => {
    if (done) return
    setSelected((prev) => {
      if (allowMultiple) return prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      return prev.includes(opt) ? [] : [opt]
    })
  }

  const confirm = () => {
    if (!selected.length || done) return
    setDone(true)
    onAnswer(selected)
    window.setTimeout(onNext, 1100)
  }

  return (
    <div className="flex min-h-full flex-col px-6 pb-28 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex items-center gap-2"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }}
        >
          <BarChart3 size={18} color="#fff" strokeWidth={2.2} />
        </span>
        <span className="font-body text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Enquete{allowMultiple ? ' · múltipla' : ''}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mb-7 font-display"
        style={{ fontSize: 'clamp(20px, 6vw, 26px)', lineHeight: 1.2, color: '#fff' }}
      >
        {question}
      </motion.h2>

      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isSel = selected.includes(opt)
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              disabled={done && !isSel}
              whileTap={{ scale: 0.985 }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 text-left"
              style={{
                minHeight: 56,
                padding: '12px 16px',
                borderRadius: 16,
                background: isSel ? '#fff' : 'rgba(255,255,255,0.10)',
                border: `1.5px solid ${isSel ? '#fff' : 'rgba(255,255,255,0.26)'}`,
                opacity: done && !isSel ? 0.5 : 1,
                transition: 'background 0.18s, border-color 0.18s, opacity 0.18s',
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: allowMultiple ? 7 : '50%',
                  background: isSel ? accent : 'transparent',
                  border: `2px solid ${isSel ? accent : 'rgba(255,255,255,0.5)'}`,
                }}
              >
                {isSel && <Check size={15} color="#fff" strokeWidth={3} />}
              </span>
              <span className="font-body" style={{ fontSize: 15, fontWeight: 600, color: isSel ? '#2e1a10' : '#fff' }}>
                {opt}
              </span>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        onClick={confirm}
        disabled={!selected.length || done}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 font-display"
        style={{
          borderRadius: 14,
          background: done ? '#5dd87a' : selected.length ? '#fff' : 'rgba(255,255,255,0.18)',
          color: done ? '#fff' : selected.length ? '#2e1a10' : 'rgba(255,255,255,0.6)',
          fontSize: 16,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {done ? (
          <>
            <Check size={18} strokeWidth={2.6} /> Obrigado pela sua resposta!
          </>
        ) : (
          'Confirmar'
        )}
      </motion.button>
    </div>
  )
}
