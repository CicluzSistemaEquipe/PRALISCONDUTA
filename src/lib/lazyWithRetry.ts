import { lazy, type ComponentType } from 'react'

/**
 * `lazy()` com recuperação automática de falha ao carregar o chunk da rota.
 *
 * Em produção / PWA, quando sai um build novo, os nomes dos chunks mudam.
 * Uma aba antiga (ou um service worker com cache velho) tenta importar um
 * arquivo que não existe mais → o import rejeita → sem ErrorBoundary o React
 * desmonta tudo e a tela fica preta (o usuário tinha que apertar F5).
 *
 * Aqui, na primeira falha de import recarregamos a página UMA vez (o mesmo que
 * o F5 faria, só que automático). Um flag em sessionStorage evita loop infinito;
 * ele é limpo assim que um import dá certo.
 */
const RELOAD_KEY = 'pralis:chunk-reload'

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      const mod = await factory()
      try { sessionStorage.removeItem(RELOAD_KEY) } catch { /* ignore */ }
      return mod
    } catch (err) {
      let alreadyTried = false
      try { alreadyTried = sessionStorage.getItem(RELOAD_KEY) === '1' } catch { /* ignore */ }
      if (!alreadyTried) {
        try { sessionStorage.setItem(RELOAD_KEY, '1') } catch { /* ignore */ }
        window.location.reload()
        // mantém o Suspense suspenso enquanto a página recarrega
        return await new Promise<{ default: T }>(() => {})
      }
      throw err
    }
  })
}
