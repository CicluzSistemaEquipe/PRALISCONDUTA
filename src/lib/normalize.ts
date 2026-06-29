// ============================================================
// Normalizacao de dados sensiveis/identificadores (Pralis)
//
// Usado no login do colaborador (nome + CPF + loja) e no targeting do Social.
// CPF e tratado SO como digitos; nunca e exibido em telas publicas nem logado.
// ============================================================

/** Mantem apenas os digitos do CPF. */
export function normalizeCPF(v: string | undefined | null): string {
  return (v ?? '').replace(/\D/g, '')
}

/** Validacao de CPF (11 digitos + digitos verificadores). */
export function isValidCPF(v: string | undefined | null): boolean {
  const cpf = normalizeCPF(v)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // todos os digitos iguais
  const calc = (slice: number) => {
    let sum = 0
    for (let i = 0; i < slice; i++) sum += parseInt(cpf[i], 10) * (slice + 1 - i)
    const d = (sum * 10) % 11
    return d === 10 ? 0 : d
  }
  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10)
}

// Combining diacritical marks U+0300..U+036F — montado por charCode para
// manter o codigo-fonte 100% ASCII (passa no check:encoding do projeto).
const DIACRITICS = new RegExp(
  '[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']',
  'g',
)

/** Normaliza texto p/ comparacao: sem acento, minusculo, espacos colapsados. */
function fold(v: string | undefined | null): string {
  return (v ?? '')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/** Nome para comparacao (case/acento-insensivel). */
export function normalizeName(v: string | undefined | null): string {
  return fold(v)
}

/** Loja/unidade para comparacao (case/acento-insensivel). */
export function normalizeStore(v: string | undefined | null): string {
  return fold(v)
}
