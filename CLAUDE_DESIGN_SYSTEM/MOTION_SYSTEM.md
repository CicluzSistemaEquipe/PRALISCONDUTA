# MOTION_SYSTEM — Pralís (operacional)

> Valores em `DESIGN_TOKENS.json` (`motion.*`). Filosofia em
> `../DESIGN_KNOWLEDGE_BASE_PRALIS/07_MOTION_GUIDELINES.md`. Aqui: tokens + snippets
> prontos. Stack: **Framer Motion 11** + CSS.

---

## 1. Princípio
**Todo movimento tem um trabalho** (entrada, progresso, transição, feedback de estado).
Se não dá para nomear a função → **remova**.

---

## 2. Tokens

**Durações** (admin / app): micro `120/150` · ui `180/220` · painel `240/280` ·
página `280/300`. Progresso/KPI `600`. Celebração `~3000`. **UI funcional ≤400ms.**

**Easing:**
```
standard:   cubic-bezier(0.2, 0, 0, 1)
emphasized: cubic-bezier(0.16, 1, 0.3, 1)   /* ease assinatura Pralís */
```
**Spring (Framer):** padrão `{stiffness:200, damping:22}` · nav pill `{stiffness:360, damping:30}`.

**Stagger:** admin 40ms · app narrativo 40–140ms · apresentação 70ms.

---

## 3. Regras duras
- **Anime só `transform` e `opacity`** (60fps).
- **App colaborador: SEM `repeat: Infinity`, SEM `backdrop-filter: blur`.**
- **`prefers-reduced-motion`** sempre (desliga transforms, mantém opacity).
- **Wrapper de transição de página NUNCA começa em `opacity:0`** (anti-tela-preta).
- Uma animação protagonista por momento.

---

## 4. Snippets prontos

**Entrada de conteúdo (Framer):**
```tsx
<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
```

**Lista com stagger:**
```tsx
const list = { show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }
```

**Tap/hover (botão):**
```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }} />
```

**Reduced motion:**
```tsx
const reduce = useReducedMotion()
transition={{ duration: reduce ? 0 : 0.4, ease: [0.16,1,0.3,1] }}
```

**CSS global reduced-motion:**
```css
@media (prefers-reduced-motion: reduce){
  *{ transition-duration:.001ms !important; animation:none !important }
}
```

**Progresso desenhando (SVG):** anime `strokeDashoffset`/`pathLength` em 0.6s.
**KPI count-up:** 0→valor, `easeOutExpo`, ~600ms, só no 1º load.

---

## 5. Catálogo (motion que vale a pena)
Entrada elegante · layout animations · page transitions · feedback de toque · números
animados · gráficos que desenham · loaders modernos · skeletons refinados · empty
states com vida · hover/focus inteligentes · expansão de card · indicadores de
progresso · gamificação visual.

## 6. Evitar
Loop infinito (app) · blur (app) · animação que atrasa a tarefa · decoração sem função
· parallax/scroll-jacking · vários elementos competindo.

---

## 7. Checklist
- [ ] Cada animação tem função nomeável?
- [ ] Durações/curvas nos tokens? Ease enfático nas entradas?
- [ ] Só `transform`/`opacity`?
- [ ] App sem loop/blur?
- [ ] `prefers-reduced-motion` tratado?
- [ ] Wrapper de página não inicia em `opacity:0`?
