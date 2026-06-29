# Criar Tela de CMS / Gestão — Pralís

**Objetivo:** desenhar uma tela de administração de conteúdo (☀️ ADMIN) — tabela-herói + CRUD em modal + editor com preview real.

## Antes de começar, carregue
- `../DESIGN_TOKENS.json`, `../COLOR_SYSTEM.md`, `../SPACING_SYSTEM.md`.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/06_UX_GUIDELINES.md` — 3 estados, escaneabilidade.
- `../../DESIGN_KNOWLEDGE_BASE_PRALIS/04_COMPONENT_LIBRARY.md` — reusar componentes admin.
- `../CMS_PATTERNS.md`.
- Telas aprovadas: `../SCREENSHOTS/APPROVED_SCREENS/admin-modulos.png`, `admin-editor-modulo.png`, `admin-colaboradores.png`.

## Perguntas de direção
1. **Entidade:** o que se gerencia? (Module/Story, colaboradores, termos…) — sem mudar o contrato congelado.
2. **Objetivo:** qual a tarefa mais frequente? (criar? editar em massa? publicar?)
3. **Preview:** o editor precisa mostrar como fica **no app real** do colaborador?
4. **Permissões:** quem edita o quê?

## Passo a passo
1. **Tabela-herói**: colunas escaneáveis, busca/filtro, status por cor+ícone+texto, ação por linha.
2. CRUD em **modal** (criar/editar) — formulário curto, validação inline, salvar otimista + toast.
3. Editor de conteúdo com **preview real** (renderiza o Module/Story como no app 🌙 dark).
4. Layout admin: sidebar 248, conteúdo com respiro; 1 laranja de ação primária (ex.: "Novo").
5. 3 estados: skeleton de tabela, empty (ícone+texto+CTA "criar"), error com retry.
6. Confirmar destrutivos (excluir) sem dark pattern; desfazer quando possível.

## Restrições / regras (CANON)
- ☀️ ADMIN: fundo `#fff`, **SEM dourado na UI**; laranja `#F26B2A` = 1 ação/tela.
- O **preview** do conteúdo usa o mundo do app (dark `#0d0800`) — não misturar as UIs.
- Contrato congelado intacto (`Module`/`Story`, desbloqueio/progresso/conclusão).
- Tokens, não números mágicos; AA (texto sobre branco = laranja escuro).

## Pronto quando
- [ ] Tabela-herói escaneável + CRUD modal + editor com preview real funcionando.
- [ ] 3 estados; destrutivos confirmados; contrato intacto.
- [ ] Sem dourado na UI; 1 laranja; tokens e AA ok.
- [ ] **Rodar `./design-review.md`** — qualquer 🔴 bloqueia.
