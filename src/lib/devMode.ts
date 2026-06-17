/**
 * Modo Desenvolvedor — Pralis Conduta
 *
 * Ativa com ?dev=1 na URL (persiste em localStorage).
 * Desativa via disableDevMode() ou removendo a chave.
 *
 * Em dev mode:
 *  - Sessão fake injetada automaticamente (sem precisar fazer login)
 *  - Todos os módulos desbloqueados no Feed
 *  - Vídeos têm botão "Skip" para pular
 *  - DevToolbar flutuante com links rápidos para todas as telas
 */
const KEY = 'pralis_dev'

export function isDevMode(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('dev') === '1') {
    localStorage.setItem(KEY, '1')
    return true
  }
  return localStorage.getItem(KEY) === '1'
}

export function enableDevMode(): void {
  localStorage.setItem(KEY, '1')
  // remove o param da URL sem reload
  const url = new URL(window.location.href)
  url.searchParams.delete('dev')
  window.history.replaceState({}, '', url.toString())
}

export function disableDevMode(): void {
  localStorage.removeItem(KEY)
  window.location.href = window.location.pathname
}
