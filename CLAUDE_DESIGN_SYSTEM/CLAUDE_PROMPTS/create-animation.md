# Criar Animação / Motion — Pralís

**Objetivo:** projetar uma animação com propósito (Framer Motion), elegante e leve, para app ou admin.

## Antes de começar, carregue
- `../MOTION_SYSTEM.md` — durações, curvas, leis de motion Pralís.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/07_MOTION_GUIDELINES.md` — quando animar, anti-padrões.
- `../DESIGN_TOKENS.json` — tokens de duração/easing.

## Perguntas de direção
1. **Mundo:** 🌙 APP (mobile, leve) ou ☀️ ADMIN (desktop)? Restrições mudam.
2. **Função:** o que esta animação **comunica**? (orienta atenção? confirma ação? revela hierarquia?)
3. **Gatilho:** entrada, hover, clique, mudança de estado, transição de rota?
4. Se não tem função nomeável → **não anima**.

## Passo a passo
1. Nomeie a função do movimento em 1 frase. Se for "ficar bonito", descarte.
2. Escolha o tipo: reveal de entrada, feedback de ação (otimista), transição de estado/rota.
3. Use **só `transform`/`opacity`** (60fps). Ease enfático `cubic-bezier(0.16,1,0.3,1)`; duração 120–300ms.
4. Snippet Framer (exemplo de reveal):
   ```tsx
   <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }} />
   ```
5. Trate `prefers-reduced-motion` (variante sem deslocamento / corte de duração).
6. Transição de página **nunca** começa em `opacity:0` total (anti-tela-preta).

## Restrições / regras (CANON)
- 🌙 APP: **sem `repeat: Infinity`, sem `backdrop-filter: blur`**, nada que pese em celular fraco.
- Tokens, não números mágicos; `will-change` controlado.
- Motion sempre com propósito; nunca decora vazio.

## Pronto quando
- [ ] Função nomeável; só transform/opacity; dentro dos tokens de duração/ease.
- [ ] Reduced-motion tratado; sem loop/blur no app; sem tela-preta na rota.
- [ ] 60fps em celular fraco.
- [ ] **Rodar `./design-review.md`** (foco no Gate 3 — Motion).
