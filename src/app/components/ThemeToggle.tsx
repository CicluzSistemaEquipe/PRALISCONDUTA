import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Pill de alternância de tema — sempre visível no topo de cada aba.
 * Botão ativo = fundo sólido (gold no dark, laranja no light) + texto branco.
 * Botão inativo = transparente + cor discreta. Garante contraste em ambos os modos.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      role="group"
      aria-label="Tema do aplicativo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: isLight ? '#f0e4d4' : 'rgba(255,245,220,0.08)',
        border: `1px solid ${isLight ? 'rgba(184,134,11,0.22)' : 'rgba(184,134,11,0.28)'}`,
        borderRadius: 99,
        padding: 3,
        gap: 2,
      }}
    >
      {([
        { id: 'dark', label: 'Escuro', Icon: Moon },
        { id: 'light', label: 'Claro', Icon: Sun },
      ] as const).map(({ id, label, Icon }) => {
        const active = theme === id
        return (
          <motion.button
            key={id}
            onClick={() => setTheme(id)}
            whileTap={{ scale: 0.92 }}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 99,
              border: 'none',
              cursor: 'pointer',
              background: active
                ? id === 'dark'
                  ? '#b8860b'
                  : '#f37435'
                : 'transparent',
              color: active
                ? '#ffffff'
                : isLight
                  ? '#8a6a50'
                  : 'rgba(255,255,255,0.40)',
              fontSize: 12,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              lineHeight: 1,
              transition: 'background 0.18s, color 0.18s',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={12} />
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
