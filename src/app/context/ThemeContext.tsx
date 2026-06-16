import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'pralis_theme'

interface ThemeValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

function readStored(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function applyTheme(t: Theme) {
  const el = document.documentElement
  // Sem data-theme === dark (fallback padrão do app). Light é o override.
  if (t === 'light') el.setAttribute('data-theme', 'light')
  else el.removeAttribute('data-theme')
}

// Aplica o tema salvo já no carregamento do módulo, antes do React montar,
// evitando "flash" de tema errado ao recarregar.
if (typeof document !== 'undefined') applyTheme(readStored())

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStored)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* modo privado — silencia */
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const toggleTheme = useCallback(() => setThemeState((p) => (p === 'dark' ? 'light' : 'dark')), [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  // fallback seguro (ex.: componente usado fora do provider) — mantém dark
  if (!ctx) return { theme: 'dark', toggleTheme: () => {}, setTheme: () => {} }
  return ctx
}
