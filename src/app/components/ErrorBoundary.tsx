import { Component, type ReactNode } from 'react'

/** Erros de carregamento de chunk (rota lazy) — devem recarregar, não dar tela preta. */
const CHUNK_RE = /Loading chunk|dynamically imported module|Importing a module script failed|ChunkLoadError/i
const RELOAD_KEY = 'pralis:chunk-reload'

interface State { error: Error | null }

/**
 * Captura erros de render/carregamento de qualquer rota e mostra um fallback
 * claro em vez de uma tela preta. Se for falha de chunk (build novo / PWA),
 * recarrega automaticamente uma vez.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (CHUNK_RE.test(error.message)) {
      let alreadyTried = false
      try { alreadyTried = sessionStorage.getItem(RELOAD_KEY) === '1' } catch { /* ignore */ }
      if (!alreadyTried) {
        try { sessionStorage.setItem(RELOAD_KEY, '1') } catch { /* ignore */ }
        window.location.reload()
      }
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            background: '#ffffff',
            color: '#1a1714',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 17, fontWeight: 700 }}>Algo não carregou direito</p>
          <p style={{ fontSize: 14, color: '#6f6862', maxWidth: 380, lineHeight: 1.5 }}>
            Tivemos um soluço ao abrir esta tela. Clique abaixo para recarregar — seus dados estão salvos.
          </p>
          <button
            onClick={() => {
              try { sessionStorage.removeItem(RELOAD_KEY) } catch { /* ignore */ }
              window.location.reload()
            }}
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 8,
              border: 'none',
              background: '#f26b2a',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
