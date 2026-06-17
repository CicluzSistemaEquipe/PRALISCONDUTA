import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

const THEME_KEY = 'pralis_theme'

interface ThemeValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

function applyDarkTheme() {
  document.documentElement.removeAttribute('data-theme')
}

if (typeof document !== 'undefined') applyDarkTheme()

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyDarkTheme()
    try {
      localStorage.setItem(THEME_KEY, 'dark')
    } catch {
      /* private mode */
    }
  }, [])

  const setTheme = useCallback((_t: Theme) => applyDarkTheme(), [])
  const toggleTheme = useCallback(() => applyDarkTheme(), [])

  return <ThemeContext.Provider value={{ theme: 'dark', toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { theme: 'dark', toggleTheme: () => {}, setTheme: () => {} }
  return ctx
}
