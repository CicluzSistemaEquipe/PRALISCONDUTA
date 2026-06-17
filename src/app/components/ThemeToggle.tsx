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
        background: isLight ? '#ffffff' : '#75483f',
        border: '1px solid var(--stroke)',
        borderRadius: 99,
        padding: 3,
        gap: 3,
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
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
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
                  : 'var(--text-secondary)',
              transition: 'background 0.18s, color 0.18s',
            }}
          >
            <Icon size={15} />
          </motion.button>
        )
      })}
    </div>
  )
}
