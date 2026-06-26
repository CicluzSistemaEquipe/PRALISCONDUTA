# 07 · Motion Guidelines — Pralís

> Manual de motion. A Pralís **gosta de movimento** — desde que ele **agregue valor**.
> Motion comunica estado, continuidade e feedback; **nunca** decora. Stack: Framer
> Motion 11 + CSS. Dois mundos, duas linguagens de movimento.

---

## 1. Princípio

**Todo movimento tem um trabalho.** Antes de animar, responda: *o que isso comunica?*
- ✅ Comunica: entrada de conteúdo, progresso, transição de contexto, feedback de
  toque, mudança de estado, direção (de onde veio / para onde vai).
- ❌ Não comunica: brilho gratuito, partícula flutuante sem razão, loop só "porque
  fica legal".

> Se você não consegue nomear a função, **remova a animação**.

---

## 2. As duas linguagens de motion

| | 🌙 Colaborador (app) | ☀️ Admin |
|---|---|---|
| **Caráter** | Expressivo, narrativo, caloroso | Snappy, discreto, funcional (Linear) |
| **Onde brilha** | Story, Lis, progresso, celebração | Feedback, continuidade, count-up |
| **Limites duros** | **Sem `repeat: Infinity`**, **sem `backdrop-filter: blur`** | Nada decorativo/looping |
| **Performance** | Leve em qualquer celular | Fluido em desktop |

---

## 3. Tokens de movimento

### Durações
| Tier | Admin | App | Uso |
|---|---|---|---|
| Micro | 120ms | ~150ms | hover, toque, troca de cor |
| UI | 180ms | ~220ms | revelar elemento, toggle |
| Painel | 240ms | ~280ms | modal/drawer/troca de slide |
| Página | 280ms | ~300ms | transição de rota |

> Regra geral: **nada acima de ~400ms** na UI funcional. Celebrações pontuais
> (confetti, conclusão) podem durar mais por serem o foco.

### Curvas (easing)
```
Padrão (entra/sai suave):     cubic-bezier(0.2, 0, 0, 1)
Enfático (entrada elegante):  cubic-bezier(0.16, 1, 0.3, 1)   ← assinatura Pralís
Spring (Framer):              type:'spring', stiffness:200, damping:22
```
A curva enfática `(0.16, 1, 0.3, 1)` é o "ease assinatura" — usada em entradas de
conteúdo e na apresentação.

### Stagger
- Listas/bullets/cards: **40–140ms** entre filhos (`staggerChildren`).
- Admin tende ao baixo (40ms); app narrativo pode ir mais alto (até 140ms).

---

## 4. Padrões por interação

| Interação | Padrão |
|---|---|
| **Entrada de conteúdo** | fade + translateY 8–16px, ease enfático, stagger |
| **Hover** | transição de cor/borda 120ms; elevação leve (admin) |
| **Click/tap** | `scale(0.97)` (app) / `scale(0.98)` (admin), 120ms |
| **Focus** | ring (`--ring`) aparece sem transform brusco |
| **Page transition** | slide-y leve (8px) + fade; **sem opacity travável** (ver nota) |
| **Modal/drawer** | 240ms slide+fade; foco preso; ESC fecha |
| **Toast** | slide-up + fade |
| **Scroll reveal** | revelar ao entrar na viewport, uma vez, com stagger |
| **Progresso** | barra/ring **desenhando** (strokeDasharray / width) em 0.6s |
| **KPI (count-up)** | número anima 0→valor, easeOutExpo, ~600ms, só no 1º load |
| **Celebração** | confetti pontual (~3s) + haptic/som; PralisSymbol comemora |

> **Nota anti-tela-preta:** no wrapper de transição de página **não** comece em
> `opacity:0` — se a animação travar (HMR/recompile), o conteúdo nunca some. Use só
> o slide-y. (Lição registrada no projeto.)

---

## 5. Motion da marca

- **Logo/símbolo:** `pathLength` (a marca "se desenha"). Usar em splash, marca em
  destaque, ícones de ilustração.
- **Lis:** estados animados casados com o momento (idle, falando/typewriter,
  comemorando, alerta). A Lis é o motion mais "vivo" — use com intenção.
- **PralisSymbolX:** "X" triplo celebrativo nas conclusões.
- **Nav pill:** `layoutId` para o morphing suave do item ativo.

---

## 6. Microinterações que valem a pena (catálogo)

Marco valoriza estas — busque oportunidades para elas, sempre com propósito:
- Entrada elegante de conteúdo · animações de layout · transições de página ·
  feedback de toque · **números animados** · gráficos que desenham · loaders
  modernos · **skeletons refinados** · empty states interessantes · hover/focus
  inteligentes · expansão de card · indicadores de progresso · gamificação visual ·
  sensação de fluidez.

---

## 7. Quando **evitar** motion

- ❌ Loops infinitos em telas do colaborador (`repeat: Infinity`) — custo de bateria/CPU.
- ❌ `backdrop-filter: blur` no app (performance em celular).
- ❌ Animação que **atrasa a tarefa** (esperar 1s pra clicar).
- ❌ Movimento decorativo sem função.
- ❌ Vários elementos competindo por atenção ao mesmo tempo.
- ❌ Parallax/scroll-jacking que tira o controle do usuário.

---

## 8. `prefers-reduced-motion` (obrigatório)

Quando o usuário pede menos movimento:
```css
@media (prefers-reduced-motion: reduce) {
  *{ transition-duration:.001ms !important; animation:none !important }
  [data-anim]{ opacity:1; transform:none }
}
```
- **Desligar** transforms, parallax, autoplay de movimento, confetti.
- **Manter** mudanças de opacidade sutis e o conteúdo 100% acessível.
- No Framer: `useReducedMotion()` para encurtar/desligar (padrão já usado em Feed,
  Progress).

---

## 9. Performance do motion (60fps)

- **Anime só `transform` e `opacity`** (compositor). Evite animar width/height/top/
  left/box-shadow em loop.
- **`will-change`** com parcimônia; remova após a animação.
- **Stagger** em vez de animar 50 itens juntos.
- **Uma animação protagonista por momento** — não orquestre tudo de uma vez.

---

## 10. Referências de motion (princípios)

- **Apple/keynote:** transições deliberadas, ease enfático, "menos porém perfeito".
- **Framer/Arc:** motion como linguagem de produto, microinteração caprichada.
- **Linear:** snappy, sem firula, feedback instantâneo (modelo do admin).
- **Duolingo:** celebração e progresso que dão vontade de continuar (modelo do app).

> Aprender o **princípio**, nunca copiar a animação. O movimento Pralís é quente e
> deliberado — calor de forno, não neon de tech.

---

### Conexões
- Onde cada componente se move → `04_COMPONENT_LIBRARY.md`
- UX que o motion serve → `06_UX_GUIDELINES.md`
- Verificação → `11_DESIGN_REVIEW_CHECKLIST.md`
