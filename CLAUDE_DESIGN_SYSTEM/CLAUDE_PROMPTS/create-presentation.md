# Criar Apresentação (Keynote) — Pralís

**Objetivo:** montar uma apresentação dark, autoral, estilo "do forno à jornada" — HTML self-contained, navegável.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — paleta (preto quente, laranja, dourado, creme).
- `../TYPOGRAPHY_SYSTEM.md` — serif **Fraunces SÓ em apresentação**; Montserrat para apoio.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/08_PRESENTATION_GUIDELINES.md` — 1 ideia/slide, ritmo, divisores.
- `../MOTION_SYSTEM.md` — transições de slide com propósito.
- `../PRESENTATION_SYSTEM.md` e exemplo em `../../docs/apresentacao/`.

## Perguntas de direção
1. **Objetivo:** convencer quem do quê? (investidor, franqueado, equipe?) — define o arco.
2. **Público + duração:** quantos slides cabem? Qual a 1 ideia que precisa ficar?
3. **Tom:** institucional quente ou emocional? "É provar e ser feliz" como fecho?
4. **Mundo visual:** keynote é **dark** (preto quente `#0d0800`), independente do mundo do produto.

## Passo a passo
1. Escreva o **conceito autoral** e o arco narrativo ("do forno à jornada") ANTES de qualquer slide.
2. 1 ideia por slide; texto curto; diagrama/mockup no lugar de parágrafo.
3. Identidade Pralís em cada slide (espiga/Lis/paleta); divisores de seção dando ritmo.
4. Tipografia: títulos em **Fraunces** (serif), apoio Montserrat; laranja só para acento/ação.
5. Entregue **HTML self-contained** (CSS/JS inline; assets embutidos ou em base64 quando viável).
6. Navegação: teclado (← →), dots/swipe, fullscreen, **modo PDF** e `prefers-reduced-motion`.

## Restrições / regras (CANON)
- Cores só do `DESIGN_TOKENS.json`; **não inventar hex**.
- Motion só `transform`/`opacity`, ease `cubic-bezier(0.16,1,0.3,1)`, 120–300ms.
- Sem slide-template genérico; cada slide tem hierarquia e respiro.
- Acessibilidade AA (contraste sobre fundo escuro; foco visível na navegação).

## Pronto quando
- [ ] Conceito autoral claro; 1 ideia/slide; identidade em todos.
- [ ] HTML abre sozinho; navegação completa + PDF + reduced-motion.
- [ ] Fraunces só aqui; paleta oficial; sem cara de template.
- [ ] **Rodar `./design-review.md`** (atenção ao Gate 8 — Apresentações).
