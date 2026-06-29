# Design Review — GATE FINAL — Pralís

**Objetivo:** rodar o gate final por gates; qualquer 🔴 crítico **bloqueia a entrega**. Auto-contido.

## Antes de começar, carregue
- O entregável (tela/fluxo/apresentação/componente) — código ou print.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/11_DESIGN_REVIEW_CHECKLIST.md` (canônico) e `10_DESIGN_RULES.md`.
- `../DESIGN_TOKENS.json`; telas aprovadas em `../SCREENSHOTS/APPROVED_SCREENS/`.

## Contexto (Gate 0 — antes de tudo)
- Mundo? 🌙 colaborador (dark/emocional) ou ☀️ admin (light/produtivo)?
- Mensagem/ação principal? Público e tarefa? Reusou tokens/componentes existentes?

## Gates (marcar 🟢/🟡/🔴 + nota em cada)
**1 · Identidade —** Parece Pralís só de olhar? Paleta oficial (sem hex inventado)? Laranja=ação (1/tela);
dourado parcimônia; **sem dourado na UI do admin**? Tipografia certa (MadeByDillan só logo; Montserrat UI;
Fraunces só apresentação)? **Sem cara de IA/template (crítico)**? Acabamento premium?

**2 · UX —** Hierarquia <3s? Escaneável? Caminho feliz curto? **3 estados** (loading/empty/error)?
Feedback em toda ação? Status por cor+ícone+texto? App: "onde parei/o que faço/quanto falta"?

**3 · Motion —** Função nomeável? Só `transform`/`opacity`? Durações 120–300ms + ease enfático?
**App sem `repeat:Infinity` e sem `blur` (crítico)**? `prefers-reduced-motion`? Rota não inicia em opacity:0?

**4 · Design System —** Tokens, não números mágicos? Componentes consistentes (sem duplicar)?
Raio/espaço/borda/elevação conforme sistema? Dark e light íntegros?

**5 · Acessibilidade (WCAG 2.2 AA) —** Contraste ≥4.5:1 texto / ≥3:1 grande (texto sobre branco = laranja
escuro)? Toque ≥44px; foco visível; teclado completo? ARIA/alt corretos? Não depende só de cor? Reduced-motion?

**6 · Performance —** Leve em celular fraco (sem blur/loop, mídia otimizada)? Code-splitting; skeletons > spinners?
Sem reflow custoso em loop; `will-change` controlado?

**7 · Produto —** Contrato congelado intacto (`Module`/`Story`, desbloqueio/progresso/conclusão/assinatura)?
Feature aditiva e desacoplada? Gamificação não virou regra de negócio? LGPD; sem dark patterns?

**8 · Apresentação (se aplicável) —** Conceito autoral; 1 ideia/slide; identidade em cada slide; navegação + PDF + reduced-motion.

## Veredito
| Gate | Status | Notas |
|---|---|---|
| 0 Contexto · 1 Identidade · 2 UX · 3 Motion · 4 DS · 5 A11y · 6 Perf · 7 Produto · 8 Apres | 🟢/🟡/🔴 | |

**Geral:** 🟢 Entregar · 🟡 Ajustes pequenos · 🔴 Refazer.
**Regra:** 🔴 em gate crítico (Identidade "cara de IA", Acessibilidade, Performance no app, Integridade de produto)
**bloqueia a entrega** — corrija e rode de novo.

## Teste rápido (30s)
1. Parece Pralís? 2. Ação principal em 3s? 3. Premium/fluido? 4. Motion comunica? 5. Acessível e leve no celular?
5 sins → provavelmente bom. Qualquer não → volte ao doc correspondente.
