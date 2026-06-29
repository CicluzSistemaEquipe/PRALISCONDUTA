# ICONOGRAPHY — Pralís

> Valores em `DESIGN_TOKENS.json` (`iconography`). Regras abaixo.

---

## 1. Biblioteca: lucide-react
- **Stroke 1.5** (consistente). **Tamanhos:** 18px na nav · 16px inline/botões · 21px no story.
- **Cor:** `text-secondary` por padrão; **laranja quando ativo/selecionado**; nunca multicor.
- **Decorativos** recebem `aria-hidden`; **ícones-ação** recebem `aria-label`.

## 2. Ícones de marca / conteúdo
- **`ModuleIcon`** — SVGs temáticos de padaria: `flower, sprout, grain, wheat, bread,
  croissant, cake, star, heart, chef`. Usados para identificar módulos/categorias.
- **Trio de espigas** (`ASSETS/simbolo-espiga.svg`) — assinatura gráfica (capas,
  divisores, favicon, momentos de marca).
- **Par de folhas / símbolo** (`simbolo-par.svg`, `simbolo-pralis.svg`) — marca
  compacta e celebração (`PralisSymbol`/`X` triplo).
- **Logo** (`LOGOS/`) — branca no escuro, preta no claro.

## 3. Regras
1. **Um sistema só:** lucide para UI; SVGs de marca para identidade/conteúdo. Não
   misturar estilos de ícone (ex.: nunca emoji multicolor + lucide na mesma UI de produto).
2. **Ícone + rótulo** para reconhecimento (nav, status). Ícone sozinho só quando
   universal (lupa, X, seta).
3. **Cor monocromática** (herda do texto/estado). Cor própria só nos símbolos de marca.
4. **Tamanho consistente** por contexto (não misturar 16/24 na mesma linha).
5. **Marca do módulo:** cada módulo tem cor + símbolo próprios (escolhidos no editor) —
   respeitar essa identidade ao renderizar o card/preview.

## 4. Em apresentações
- Ícones lucide consistentes **ou** emoji temático com **muita** parcimônia (1 por card),
  nunca clip-art multicolor genérico.

## 5. Checklist
- [ ] lucide (stroke 1.5) na UI?
- [ ] Tamanho certo por contexto (18 nav · 16 inline)?
- [ ] Monocromático, laranja quando ativo?
- [ ] Ícone-ação com `aria-label`; decorativo `aria-hidden`?
- [ ] Símbolos de marca só onde fazem sentido (não como ícone de UI genérico)?
