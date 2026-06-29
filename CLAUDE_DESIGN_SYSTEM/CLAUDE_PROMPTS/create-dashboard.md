# Criar Dashboard — Pralís

**Objetivo:** desenhar um dashboard de visão geral (KPIs + gráficos sóbrios + drill-down) para o mundo ☀️ ADMIN.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — cores/spacing/raio (NUNCA inventar hex).
- `../COLOR_SYSTEM.md` e `../SPACING_SYSTEM.md` — escala base 4, superfícies admin.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` — hierarquia, 3 estados, escaneabilidade.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/04_COMPONENT_LIBRARY.md` — reusar antes de criar.
- `../DASHBOARD_PATTERNS.md`.
- Referência aprovada: `../SCREENSHOTS/APPROVED_SCREENS/admin-dashboard.png`, `admin-gerentes.png` (drill-down 360).

## Perguntas de direção (responder antes de desenhar)
1. **Mundo:** confirmar ADMIN (claro). Dashboard NÃO existe no app colaborador.
2. **Objetivo:** qual decisão esse dashboard precisa destravar em <5s? (ex.: "quem está atrasado no treinamento?")
3. **Público:** dono/RH ou gerente de unidade? Muda granularidade e drill-down.
4. **KPIs:** quais 3–5 números importam de verdade? O que é ruído?
5. **Drill-down:** do agregado até qual nível? (Unidade → Gerente → Equipe → Colaborador.)

## Passo a passo
1. Defina a **pergunta-chave** e escolha 3–5 KPIs que a respondem. Corte o resto.
2. Topo: linha de KPIs (cartão claro, número grande Montserrat, label discreto, delta com cor+ícone+texto).
3. Meio: 1–2 gráficos **sóbrios** (linha/barra; sem 3D, sem rainbow). Cor de série em tons neutros + 1 destaque.
4. Tabela-herói abaixo, com colunas escaneáveis e **drill-down por clique** (linha → detalhe 360).
5. Layout: sidebar 248px, conteúdo com respiro; grid responsivo desktop-first.
6. Estados: skeleton ao carregar, empty (ícone+texto+CTA), error com retry.

## Restrições / regras (CANON)
- ☀️ ADMIN: fundo `#fff`, texto escuro; **laranja `#F26B2A` = no máx. 1 ação primária por tela**.
- **SEM dourado na UI do admin** (dourado é só brilho emocional do app).
- Tokens do `DESIGN_TOKENS.json`; nada de número mágico. Tipografia Montserrat (UI).
- Status sempre por **cor + ícone + texto** (não só cor). Contraste AA (texto sobre branco = laranja escuro).
- Sem cara de template/IA. Identidade Pralís presente (sem exagero de marca em tela produtiva).

## Pronto quando
- [ ] Pergunta-chave respondível em <5s; KPIs justificados.
- [ ] Drill-down funciona até o nível combinado; 3 estados presentes.
- [ ] Zero dourado na UI; 1 laranja de ação; tokens respeitados; AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia entrega.
