// ============================================================
// Assets reais da marca Pralís (importados → o Vite versiona/otimiza)
// ============================================================

import logoLaranja from '@/assets/brand/logo-primario-laranja.png'
import logoBege from '@/assets/brand/logo-primario-bege.png'
import logoFundoBordo from '@/assets/brand/logo-primario-fundo-bordo.png'
import logoSecBege from '@/assets/brand/logo-secundario-bege.png'
import symbolUrl from '@/assets/brand/simbolo-pralis.svg'
import patternUrl from '@/assets/brand/padrao-fundo.svg'
// SVGs oficiais da identidade (vetoriais)
import logoSVGBranca from '@/assets/brand/logo-branca.svg?url'
import logoSVGPreta from '@/assets/brand/logo-preta.svg?url'
import simboloPar from '@/assets/brand/simbolo-par.svg?url'
import simboloEspiga from '@/assets/brand/simbolo-espiga.svg?url'
import patternBrand from '@/assets/brand/pattern-brand.svg?url'

export const brand = {
  /** logo laranja — para fundos claros */
  logoLaranja,
  /** logo bege — para fundos escuros (uso padrão no app) */
  logoBege,
  logoFundoBordo,
  logoSecBege,
  /** espiga de trigo (símbolo) — usa currentColor */
  symbolUrl,
  /** padrão de espigas — textura de fundo */
  patternUrl,
  /** logo vetorial branca — fundos escuros (nítida) */
  logoSVGBranca,
  /** logo vetorial preta — fundos claros */
  logoSVGPreta,
  /** símbolo par de folhas (ouro/laranja/marrom) */
  simboloPar,
  /** símbolo espiga crescendo (3 níveis) */
  simboloEspiga,
  /** padrão de fundo oficial da marca */
  patternBrand,
}

/** filtro CSS para pintar um <img> SVG/PNG de branco */
export const FILTER_WHITE = 'brightness(0) invert(1)'
