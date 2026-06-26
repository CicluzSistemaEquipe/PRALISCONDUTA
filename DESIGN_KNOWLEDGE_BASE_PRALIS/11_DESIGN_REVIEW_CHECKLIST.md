# 11 · Design Review Checklist — Pralís

> Checklist que **qualquer IA ou pessoa** roda **antes de finalizar** qualquer tela,
> componente, apresentação ou material. Estruturado em **gates**: qualquer gate
> reprovado (RED) **bloqueia a entrega**. Baseado nos gates IADOMARCO.

**Como usar:** marque cada item. Se um item crítico falha, descreva e **corrija antes
de entregar**. Ao final, dê o veredito por gate (🟢/🟡/🔴) e o veredito geral.

---

## 🎯 Gate 0 — Contexto (antes de tudo)
- [ ] Em qual **mundo** estou? 🌙 colaborador (dark/emocional) ou ☀️ admin (light/produtivo)?
- [ ] Qual é a **mensagem/ação principal** desta tela?
- [ ] Qual **público** e qual **tarefa** ele quer cumprir?
- [ ] Reusei componentes/tokens existentes (docs 03/04) antes de criar?

## 🎨 Gate 1 — Design / Identidade (Creative Director)
- [ ] Dá pra saber que é **Pralís** só de olhar? (espigas/Lis/paleta/tipografia)
- [ ] Paleta **oficial** (doc 03) — nada de cor inventada?
- [ ] **Laranja = ação** (uma por tela); dourado com parcimônia; sem dourado na UI clara do admin?
- [ ] Tipografia certa (MadeByDillan só no logo; Montserrat na UI; serif só em apresentação)?
- [ ] **Sem cara de template / IA / genérico?** ← crítico
- [ ] Acabamento premium (alinhamento, ritmo de espaço, microdetalhe)?

## 🧭 Gate 2 — UX (UX/UI Reviewer)
- [ ] **Hierarquia** clara: mensagem #1 salta em <3s?
- [ ] **Escaneável**: blocos previsíveis, texto curto, ícone+rótulo?
- [ ] **Caminho feliz** curto (mínimo de cliques/decisões)?
- [ ] **3 estados** presentes: loading (skeleton), empty (ícone+texto+CTA), error (retry)?
- [ ] **Feedback** em toda ação (otimista + toast quando couber)?
- [ ] Estado visual de status por **cor + ícone + texto**?
- [ ] **App:** responde "onde parei / o que faço / quanto falta"? Próximo passo óbvio?

## 🎬 Gate 3 — Motion (Motion Director)
- [ ] Toda animação tem **função nomeável** (não decora)?
- [ ] Durações/curvas dentro dos tokens (doc 07)? Ease enfático onde cabe?
- [ ] **App:** sem `repeat: Infinity`, sem `backdrop-filter: blur`?
- [ ] Anima só `transform`/`opacity` (60fps)?
- [ ] **`prefers-reduced-motion`** tratado?
- [ ] Transição de página **não** começa em `opacity:0` (anti-tela-preta)?

## 🧩 Gate 4 — Design System (Design System Guardian)
- [ ] **Tokens, não números mágicos** (CSS vars, escala base 4)?
- [ ] Componentes consistentes com a biblioteca (doc 04)? Sem duplicar?
- [ ] Raio/espaço/borda/elevação conforme doc 03?
- [ ] Dark e light (quando aplicável) íntegros — sem texto claro sobre fundo claro?

## ♿ Gate 5 — Acessibilidade (Accessibility Director · WCAG 2.2 AA)
- [ ] **Contraste** ≥4.5:1 (texto) / ≥3:1 (grande/ícone)? Texto sobre branco = laranja escuro?
- [ ] **Toque ≥44px** (mobile); **foco visível**; ordem de foco lógica?
- [ ] **Teclado** completo (Tab/Enter/Esc/setas no story)?
- [ ] **ARIA** correto; ícones decorativos `aria-hidden`; imagens com `alt`?
- [ ] **Não depende só de cor** para informação?
- [ ] Reduced-motion respeitado?

## ⚡ Gate 6 — Performance (Performance Reviewer)
- [ ] **App leve em celular fraco** (sem blur, sem loop infinito, imagens/vídeos otimizados)?
- [ ] Code-splitting por rota; skeletons rápidos > spinners?
- [ ] Sem reflow/animção custosa em loop; `will-change` controlado?
- [ ] Assets de marca/mídia em tamanho adequado (poster para vídeo)?

## 🔒 Gate 7 — Integridade de produto
- [ ] **Contrato congelado** intacto? (não mexeu em `Module`/`Story`, desbloqueio,
      progresso, conclusão, assinatura)
- [ ] Feature nova é **aditiva e desacoplada**?
- [ ] Gamificação não virou **regra de negócio**?
- [ ] **Privacidade**: só coleta o que vira decisão (LGPD)?
- [ ] Sem **dark patterns**?

## 📊 Gate 8 — Apresentações (quando aplicável)
- [ ] Conceito autoral antes dos slides; 1 ideia por slide; pouco texto?
- [ ] Identidade Pralís em cada slide; divisores dando ritmo?
- [ ] Diagramas/mockups em vez de parágrafos?
- [ ] Navegação (teclado/dots/swipe/fullscreen) + modo PDF + reduced-motion?

---

## Veredito (preencher)

| Gate | Status | Notas |
|---|---|---|
| 0 · Contexto | 🟢/🟡/🔴 | |
| 1 · Design/Identidade | | |
| 2 · UX | | |
| 3 · Motion | | |
| 4 · Design System | | |
| 5 · Acessibilidade | | |
| 6 · Performance | | |
| 7 · Produto | | |
| 8 · Apresentação | | |

**Veredito geral:** 🟢 Entregar · 🟡 Ajustes pequenos · 🔴 Refazer

> **Regra:** qualquer 🔴 em gate crítico (Identidade "cara de IA", Acessibilidade,
> Performance no app, Integridade de produto) **bloqueia a entrega**. Corrija e rode
> o checklist de novo.

---

## Teste rápido (versão de 30 segundos)
1. **Parece Pralís?** (não-genérico)
2. **Entendo em 3s** qual a ação principal?
3. **Premium** — fluido, organizado, confiável?
4. **Motion** comunica ou enfeita?
5. **Acessível e leve** no celular?

5 sins → provavelmente bom. Qualquer não → volte aos docs correspondentes.

---

### Conexões
- Regras por trás de cada item → `10_DESIGN_RULES.md`
- Como a IA aplica tudo → `12_AI_CONTEXT.md`
