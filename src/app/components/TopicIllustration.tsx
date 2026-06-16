import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface TopicIllustrationProps {
  tag: string
  accent?: string
  size?: number
}

const PATH_ANIM = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
}

const pathTransition = (delay: number, duration = 1.0) => ({
  pathLength: { duration, delay, ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number] },
  opacity: { duration: 0.2, delay },
})

const stroke = (color: string, width = 2.5) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
})

export function TopicIllustration({ tag, accent = '#b8860b', size = 88 }: TopicIllustrationProps) {
  const s = stroke(accent)

  const svgs: Record<string, ReactNode> = {
    // ── BOAS-VINDAS ──
    'Sobre o Código': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M18 8 L18 72 L62 72 L62 8 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.8)} />
        <motion.path d="M18 8 L50 8 L62 20 L62 8" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.1, 0.5)} />
        <motion.path d="M50 8 L50 20 L62 20" {...s} strokeWidth={1.5} {...PATH_ANIM} transition={pathTransition(0.4, 0.3)} />
        <motion.path d="M28 46 L37 56 L54 36" stroke={accent} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.75, 0.65)} />
      </svg>
    ),

    // ── JORNADA ──
    'O novo colaborador': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.circle cx="40" cy="22" r="12" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.path d="M20 68 C20 50 60 50 60 68" {...s} {...PATH_ANIM} transition={pathTransition(0.5, 0.7)} />
        <motion.path d="M58 14 L60 20 L66 20 L61 24 L63 30 L58 26 L53 30 L55 24 L50 20 L56 20 Z" stroke={accent} strokeWidth={1.8} fill="none" strokeLinejoin="round" {...PATH_ANIM} transition={pathTransition(0.9, 0.6)} />
      </svg>
    ),
    'O colaborador efetivado': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 10 L64 22 L64 46 C64 60 40 72 40 72 C40 72 16 60 16 46 L16 22 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.9)} />
        <motion.path d="M40 28 L43 36 L52 36 L45 42 L47 50 L40 45 L33 50 L35 42 L28 36 L37 36 Z" stroke={accent} strokeWidth={2} fill="none" strokeLinejoin="round" {...PATH_ANIM} transition={pathTransition(0.7, 0.7)} />
      </svg>
    ),
    'O ex-colaborador': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M20 70 L20 18 L50 10 L50 70" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.path d="M14 70 L56 70" {...s} {...PATH_ANIM} transition={pathTransition(0.5, 0.4)} />
        <motion.path d="M56 38 L70 38" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.8, 0.4)} />
        <motion.path d="M62 30 L70 38 L62 46" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(1.0, 0.35)} />
        <motion.rect x="27" y="38" width="14" height="12" rx="2" {...s} strokeWidth={1.8} {...PATH_ANIM} transition={pathTransition(0.6, 0.4)} />
        <motion.path d="M30 38 C30 30 41 30 41 38" {...s} strokeWidth={1.8} {...PATH_ANIM} transition={pathTransition(0.55, 0.4)} />
      </svg>
    ),

    // ── DEVERES ──
    'Pontualidade & uniforme': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.circle cx="40" cy="42" r="28" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.8)} />
        <motion.path d="M40 42 L40 24" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.7, 0.4)} />
        <motion.path d="M40 42 L54 50" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.9, 0.4)} />
        <motion.circle cx="40" cy="42" r="3" stroke={accent} strokeWidth={2} fill={accent} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1, duration: 0.2 }} />
        <motion.path d="M36 14 L44 14 M40 10 L40 16" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0.3, 0.3)} />
      </svg>
    ),
    'Segurança & cuidado': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 10 L64 22 L64 46 C64 60 40 72 40 72 C40 72 16 60 16 46 L16 22 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.9)} />
        <motion.path d="M40 54 C40 54 26 44 26 36 C26 30 31 26 36 28 C38 29 40 32 40 32 C40 32 42 29 44 28 C49 26 54 30 54 36 C54 44 40 54 40 54 Z" stroke={accent} strokeWidth={2} fill="none" {...PATH_ANIM} transition={pathTransition(0.75, 0.8)} />
      </svg>
    ),
    'Cliente & qualidade': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 8 L48 28 L70 28 L53 42 L59 62 L40 50 L21 62 L27 42 L10 28 L32 28 Z" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0, 1.0)} />
        <motion.path d="M32 38 Q40 44 48 38" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0.9, 0.4)} />
        <motion.circle cx="34" cy="34" r="2" stroke={accent} fill={accent} strokeWidth={1} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, duration: 0.2 }} />
        <motion.circle cx="46" cy="34" r="2" stroke={accent} fill={accent} strokeWidth={1} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.05, duration: 0.2 }} />
      </svg>
    ),
    'Convivência & responsabilidade': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M10 20 Q10 10 20 10 L45 10 Q55 10 55 20 L55 36 Q55 46 45 46 L28 46 L18 56 L22 46 L20 46 Q10 46 10 36 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.85)} />
        <motion.path d="M22 28 L30 36 L46 20" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.7, 0.5)} />
        <motion.path d="M40 42 Q40 34 50 34 L66 34 Q72 34 72 40 L72 50 Q72 56 66 56 L60 56 L62 62 L56 56 L50 56 Q40 56 40 50 Z" {...s} strokeWidth={1.8} opacity={0.5} {...PATH_ANIM} transition={pathTransition(0.4, 0.7)} />
        <motion.path d="M52 40 L62 50 M62 40 L52 50" stroke="#f87171" strokeWidth={2} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.9, 0.35)} />
      </svg>
    ),

    // ── PROIBIDO ──
    'Respeito acima de tudo': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 10 L64 22 L64 46 C64 60 40 72 40 72 C40 72 16 60 16 46 L16 22 Z" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0, 0.9)} />
        <motion.path d="M28 30 L52 56 M52 30 L28 56" stroke="#f87171" strokeWidth={3.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.75, 0.55)} />
      </svg>
    ),
    'Imagem & voz da empresa': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M18 28 L18 52 L30 52 L52 64 L52 16 L30 28 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.85)} />
        <motion.path d="M58 28 Q64 40 58 52" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.7, 0.4)} />
        <motion.path d="M54 22 L68 58" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.9, 0.5)} />
      </svg>
    ),
    'Bens, sigilo & multa': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.rect x="22" y="38" width="28" height="24" rx="4" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.path d="M28 38 C28 22 50 22 50 38" {...s} {...PATH_ANIM} transition={pathTransition(0.1, 0.65)} />
        <motion.circle cx="36" cy="48" r="4" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.6, 0.3)} />
        <motion.path d="M36 52 L36 58" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0.75, 0.2)} />
        <motion.path d="M58 22 L70 44 L46 44 Z" stroke="#f37435" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.85, 0.55)} />
        <motion.path d="M58 28 L58 36" stroke="#f37435" strokeWidth={2.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.1, 0.2)} />
        <motion.circle cx="58" cy="40" r="1.5" stroke="#f37435" fill="#f37435" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
      </svg>
    ),
    'No expediente': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.rect x="24" y="12" width="28" height="48" rx="5" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.75)} />
        <motion.rect x="28" y="18" width="20" height="34" rx="2" {...s} strokeWidth={1.5} {...PATH_ANIM} transition={pathTransition(0.5, 0.4)} />
        <motion.path d="M30 22 L46 50 M46 22 L30 50" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.8, 0.45)} />
        <motion.circle cx="38" cy="56" r="3" {...s} strokeWidth={1.5} {...PATH_ANIM} transition={pathTransition(0.6, 0.25)} />
      </svg>
    ),
    'Situação com o cliente': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.circle cx="22" cy="24" r="10" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.6)} />
        <motion.path d="M6 62 C6 46 38 46 38 62" {...s} {...PATH_ANIM} transition={pathTransition(0.45, 0.6)} />
        <motion.path d="M52 62 L52 30 M52 30 C52 26 58 26 58 30 L58 44 M58 34 C58 30 64 30 64 34 L64 44 M64 38 C64 34 70 34 70 38 L70 44 L70 50 C70 58 62 62 54 62 L52 62" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.7, 1.0)} />
      </svg>
    ),

    // ── PREPARO ──
    'Higiene & segurança': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M20 44 L20 54 L60 54 L60 44" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.5)} />
        <motion.path d="M24 44 Q24 20 40 16 Q56 20 56 44" {...s} {...PATH_ANIM} transition={pathTransition(0.3, 0.8)} />
        <motion.path d="M16 54 L64 54" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.7, 0.4)} />
        <motion.path d="M38 28 L46 32 L46 40 C46 44 40 48 40 48 C40 48 34 44 34 40 L34 32 Z" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.9, 0.6)} />
        <motion.path d="M36 38 L39 41 L44 34" stroke="#4ade80" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.2, 0.35)} />
      </svg>
    ),
    'Receitas & equipamentos': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 14 L40 66" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0, 0.45)} />
        <motion.path d="M28 66 L52 66" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.3, 0.35)} />
        <motion.path d="M14 28 L66 28" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.5, 0.5)} />
        <motion.path d="M14 28 L14 44 Q14 50 22 50 Q30 50 30 44 L30 28" {...s} {...PATH_ANIM} transition={pathTransition(0.8, 0.5)} />
        <motion.path d="M50 28 L50 44 Q50 50 58 50 Q66 50 66 44 L66 28" {...s} {...PATH_ANIM} transition={pathTransition(0.85, 0.5)} />
      </svg>
    ),

    // ── ATENDIMENTO ──
    'Apresentação': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.circle cx="40" cy="22" r="11" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.6)} />
        <motion.path d="M22 62 C22 46 58 46 58 62" {...s} {...PATH_ANIM} transition={pathTransition(0.45, 0.6)} />
        <motion.path d="M30 46 L30 60 M50 46 L50 60 M30 50 L50 50" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.7, 0.45)} />
        <motion.path d="M40 50 L41.5 53.5 L45.5 53.5 L42.5 55.8 L43.5 59.5 L40 57 L36.5 59.5 L37.5 55.8 L34.5 53.5 L38.5 53.5 Z" stroke={accent} strokeWidth={1.5} fill="none" strokeLinejoin="round" {...PATH_ANIM} transition={pathTransition(1.0, 0.5)} />
      </svg>
    ),
    'Postura no atendimento': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 68 C40 68 10 52 10 30 C10 18 20 12 30 16 C35 18 40 24 40 24 C40 24 45 18 50 16 C60 12 70 18 70 30 C70 52 40 68 40 68 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 1.0)} />
        <motion.path d="M28 38 Q40 48 52 38" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0.85, 0.45)} />
        <motion.circle cx="30" cy="32" r="3" stroke={accent} fill={accent} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1, type: 'spring' }} />
        <motion.circle cx="50" cy="32" r="3" stroke={accent} fill={accent} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.15, type: 'spring' }} />
      </svg>
    ),

    // ── CAIXA ──
    'Segurança do caixa': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.rect x="14" y="18" width="52" height="48" rx="6" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.circle cx="40" cy="42" r="16" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.6, 0.6)} />
        <motion.circle cx="40" cy="42" r="5" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(1.0, 0.3)} />
        <motion.path d="M40 32 L40 36 M48 42 L44 42 M40 48 L40 52 M32 42 L36 42" {...s} strokeWidth={1.5} {...PATH_ANIM} transition={pathTransition(0.9, 0.4)} />
        <motion.path d="M22 66 L22 72 M58 66 L58 72" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.4, 0.3)} />
      </svg>
    ),
    'Regra de ouro': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M24 68 L24 30 M24 30 C24 24 34 24 34 30 L34 48 M34 34 C34 28 44 28 44 34 L44 48 M44 38 C44 32 54 32 54 38 L54 48 L54 58 C54 64 44 68 36 68 L24 68" stroke={accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0, 1.1)} />
        <motion.circle cx="62" cy="22" r="12" stroke="#f87171" strokeWidth={2} fill="none" {...PATH_ANIM} transition={pathTransition(0.5, 0.5)} />
        <motion.path d="M56 16 L68 28 M68 16 L56 28" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.85, 0.45)} />
      </svg>
    ),

    // ── LIMPEZA ──
    'Higiene contínua': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M54 10 L26 66" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.path d="M14 64 Q20 54 26 66 Q32 54 38 66 Q44 54 50 66 Q56 54 62 66 L14 66 Z" {...s} {...PATH_ANIM} transition={pathTransition(0.6, 0.6)} />
        <motion.path d="M58 24 L62 16 M62 24 L58 16 M60 20 L68 20 M60 20 L52 20" stroke={accent} strokeWidth={2} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.9, 0.45)} />
        <motion.path d="M66 42 L68 38 M68 42 L66 38 M67 40 L71 40 M67 40 L63 40" stroke={accent} strokeWidth={1.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.1, 0.35)} />
      </svg>
    ),
    'Produtos & EPIs': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M14 46 L14 50 L66 50 L66 46" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.5, 0.45)} />
        <motion.path d="M18 46 C18 22 62 22 62 46" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0, 0.75)} />
        <motion.path d="M40 18 L40 26" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0.1, 0.25)} />
        <motion.path d="M10 50 L70 50" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.6, 0.4)} />
        <motion.path d="M40 56 L54 72 L26 72 Z" stroke="#f37435" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.8, 0.5)} />
        <motion.path d="M40 62 L40 66" stroke="#f37435" strokeWidth={2.5} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.1, 0.2)} />
        <motion.circle cx="40" cy="69" r="1.5" stroke="#f37435" fill="#f37435" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
      </svg>
    ),

    // ── FUNÇÃO EXTERNA ──
    'Postura externa': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 10 C24 10 14 22 14 34 C14 54 40 72 40 72 C40 72 66 54 66 34 C66 22 56 10 40 10 Z" {...s} {...PATH_ANIM} transition={pathTransition(0, 0.9)} />
        <motion.circle cx="40" cy="34" r="10" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.75, 0.5)} />
        <motion.path d="M34 34 L38 38 L47 28" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.1, 0.45)} />
      </svg>
    ),
    'Limites & responsabilidade': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M10 48 L22 36 L32 36 L38 30 L46 30 L54 36 L62 36 L70 44" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0, 0.8)} />
        <motion.path d="M10 44 L14 44 L22 36" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.3, 0.3)} />
        <motion.path d="M70 48 L62 36" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.35, 0.3)} />
        <motion.path d="M28 20 L52 56 M52 20 L28 56" stroke="#f87171" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} {...PATH_ANIM} transition={pathTransition(0.85, 0.55)} />
      </svg>
    ),

    // ── FORNECEDORES & SOCIEDADE ──
    Fornecedores: (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M10 48 L22 36 L32 36 L40 30 L48 30 L58 36 L68 36 L70 44" {...s} strokeWidth={2.5} {...PATH_ANIM} transition={pathTransition(0, 0.85)} />
        <motion.path d="M10 44 L14 44 L22 36" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.3, 0.3)} />
        <motion.path d="M68 48 L60 36" {...s} strokeWidth={2} {...PATH_ANIM} transition={pathTransition(0.35, 0.3)} />
        <motion.path d="M40 8 L43 16 L52 16 L45 22 L48 30 L40 25 L32 30 L35 22 L28 16 L37 16 Z" stroke={accent} strokeWidth={1.8} strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.8, 0.7)} />
      </svg>
    ),
    Sociedade: (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.path d="M40 70 C40 70 12 54 12 28 C12 14 24 10 40 18 C56 10 68 14 68 28 C68 54 40 70 40 70 Z" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0, 0.9)} />
        <motion.path d="M40 18 L40 70" stroke="#4ade80" strokeWidth={1.8} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.7, 0.5)} />
        <motion.path d="M40 34 L28 42 M40 46 L30 54 M40 34 L52 42 M40 46 L50 54" stroke="#4ade80" strokeWidth={1.2} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.9, 0.5)} />
      </svg>
    ),

    // ── PENALIDADES ──
    'Medidas disciplinares': (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <motion.rect x="16" y="18" width="40" height="22" rx="5" stroke="#f87171" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" {...PATH_ANIM} transition={pathTransition(0, 0.7)} />
        <motion.path d="M46 40 L66 66" stroke={accent} strokeWidth={4} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(0.6, 0.55)} />
        <motion.path d="M16 72 L66 72" {...s} strokeWidth={3} {...PATH_ANIM} transition={pathTransition(0.85, 0.45)} />
        <motion.path d="M18 62 L14 56 M24 66 L18 62 M30 68 L26 64" stroke="#f87171" strokeWidth={1.8} strokeLinecap="round" fill="none" {...PATH_ANIM} transition={pathTransition(1.1, 0.35)} />
      </svg>
    ),
  }

  const illustration = svgs[tag]
  if (!illustration) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }}
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      {illustration}
    </motion.div>
  )
}
