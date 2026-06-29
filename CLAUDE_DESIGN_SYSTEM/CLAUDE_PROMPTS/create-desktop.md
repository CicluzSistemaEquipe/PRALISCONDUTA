# Criar Tela Desktop (Admin) — Pralís

**Objetivo:** desenhar uma tela ☀️ do admin, **desktop-first responsivo**, produtiva e clara.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json` — superfícies/cores do admin (claro).
- `../LAYOUT_PATTERNS.md`.
- `../COLOR_SYSTEM.md`, `../SPACING_SYSTEM.md`.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md`, `04_COMPONENT_LIBRARY.md`.
- Telas aprovadas: `../SCREENSHOTS/APPROVED_SCREENS/admin-dashboard.png`, `admin-colaboradores.png`, `admin-relatorios.png`, `admin-gerentes.png`.

## Perguntas de direção
1. **Objetivo:** qual a tarefa de gestão central desta tela? Decisão em <5s?
2. **Densidade:** muita informação tabular ou poucos cartões de visão geral?
3. **Público:** dono/RH ou gerente de unidade?
4. **Responsivo:** como degrada em telas menores (sidebar colapsa, tabela vira lista)?

## Passo a passo
1. Estrutura: **sidebar 248px** + área de conteúdo com respiro e largura máxima legível.
2. Topo de página: título + 1 ação primária laranja (no máx. 1) + filtros/busca.
3. Conteúdo: **tabela-herói** ou grid de KPIs conforme a tarefa; colunas escaneáveis.
4. Status por cor+ícone+texto; ações por linha; drill-down quando fizer sentido.
5. 3 estados: skeleton, empty (ícone+texto+CTA), error (retry).
6. Responsivo: sidebar colapsável, tabela adaptável; motion sutil com propósito.

## Restrições / regras (CANON)
- ☀️ ADMIN: fundo `#fff`, ação `#F26B2A` (1/tela), **SEM dourado na UI** (dourado é só do app).
- Tipografia Montserrat; tokens, não números mágicos; AA (laranja escuro sobre branco).
- Sem cara de template/IA; reusar componentes admin existentes.

## Pronto quando
- [ ] Sidebar 248 + tabela/KPIs claros; tarefa resolvível em <5s.
- [ ] 1 laranja de ação; sem dourado; responsivo degrada bem.
- [ ] 3 estados; tokens e AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
