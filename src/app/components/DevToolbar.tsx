import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MODULES } from '@/lib/content'
import { disableDevMode } from '@/lib/devMode'

/** Painel flutuante de navegação rápida — visível apenas em DEV MODE (?dev=1) */
export function DevToolbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const go = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  const SCREENS = [
    { label: 'Splash', path: '/' },
    { label: 'Onboarding', path: '/conheca' },
    { label: 'Login', path: '/login' },
    { label: 'Feed', path: '/feed' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Progresso', path: '/progresso' },
    { label: 'Conclusão', path: '/conclusao' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: 12,
        zIndex: 9999,
        maxWidth: 280,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              background: '#1a0e00',
              border: '1px solid rgba(184,134,11,0.40)',
              borderRadius: 16,
              padding: '14px 12px',
              marginBottom: 10,
              boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#f37435', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                🛠 Dev Mode
              </span>
              <button
                onClick={() => { disableDevMode() }}
                style={{
                  background: 'rgba(243,116,53,0.18)',
                  border: '1px solid rgba(243,116,53,0.35)',
                  color: '#f37435',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Desativar
              </button>
            </div>

            {/* telas */}
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(184,134,11,0.7)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 5 }}>
              Telas
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {SCREENS.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => go(path)}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 7,
                    border: pathname === path ? '1px solid #b8860b' : '1px solid rgba(255,255,255,0.12)',
                    background: pathname === path ? 'rgba(184,134,11,0.25)' : 'rgba(255,255,255,0.05)',
                    color: pathname === path ? '#d4a017' : 'rgba(255,255,255,0.75)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* módulos */}
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, color: 'rgba(184,134,11,0.7)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 5 }}>
              Módulos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {MODULES.map((m) => {
                const path = `/modulo/${m.id}`
                const active = pathname === path
                return (
                  <button
                    key={m.id}
                    onClick={() => go(path)}
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 11,
                      fontWeight: active ? 700 : 500,
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: active ? `1px solid ${m.accent}80` : '1px solid rgba(255,255,255,0.08)',
                      background: active ? `${m.accent}22` : 'rgba(255,255,255,0.04)',
                      color: active ? m.accent : 'rgba(255,255,255,0.70)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{m.number}</span>
                    {m.title}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* botão toggle */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        style={{
          background: open ? '#b8860b' : 'rgba(26,14,0,0.92)',
          border: '1px solid rgba(184,134,11,0.55)',
          borderRadius: 12,
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
          color: open ? '#fff' : '#d4a017',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.08em',
        }}
      >
        ⚙ DEV
      </motion.button>
    </div>
  )
}
