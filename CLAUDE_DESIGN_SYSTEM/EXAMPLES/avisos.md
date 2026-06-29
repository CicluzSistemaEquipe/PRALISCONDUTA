# Avisos — Admin · 🟡 PLANEJADO (P3)

> **Status: PLANEJADO / PROPOSTA — esta tela NÃO existe ainda.** Sem screenshot. Documentação prospectiva para alinhar antes de construir. Não há contrato congelado afetado; entrada será **aditiva** ao CMS.

**Mundo:** ☀️ Admin (CMS) · **Rota proposta:** `/admin/avisos`

## Objetivo (proposto)
Permitir que o dono/gerente publique avisos e comunicados que aparecem para os colaboradores no app — uma camada leve de comunicação interna sobre a trilha de treinamento.

## Hierarquia visual (proposta)
1. **AdminPageHeader** (eyebrow `COMUNICAÇÃO` + h1 "Avisos" + subtítulo) com a única ação accent **"+ Novo aviso"**.
2. **Fileira de StatCards** (Ativos · Agendados · Rascunhos · Alcance).
3. **Lista/tabela de avisos** (Título · Público-alvo · Período · Status) com StatusBadge (Rascunho/Agendado/Publicado/Expirado) e ações editar/arquivar no hover. `EmptyState` quando não há avisos ("Nenhum aviso ainda · Criar o primeiro").

## Fluxo do usuário (proposto)
Entra → "+ Novo aviso" → escreve título/mensagem, escolhe público (todos / por cargo / por gerente) e janela de exibição → salva rascunho ou publica → o aviso aparece no app do colaborador (provável banner/sino na Home).

## Componentes utilizados (reuso do inventário)
`AdminLayout`, `AdminSidebar` (novo item no grupo — provável "Comunicação" ou dentro de "Conteúdo"), `AdminTopbar` (o **sino** já existente passa a refletir avisos), `AdminPageHeader` (+1 ação accent), `StatCard`, **tabela herói**, `StatusBadge`, `EmptyState`, `ModalShell`/editor de aviso (reusar `SlideEditor` para o corpo de texto), chips de público-alvo. No app 🌙: provável `LisCard`/banner para exibir o aviso (a definir).

## Tokens / identidade (a respeitar quando construir)
Manter regras do mundo ☀️: 1 accent `color.admin.accent` por tela, cards com **borda** `color.admin.border` (`elevation._principle`), StatusBadge cor+ícone+texto (`accessibility.statusRule`), KPIs tabular com count-up. Sem dourado na UI admin. Decisões de hex/token novos = escalar, não inventar.

## Pendências antes de construir
- Definir canais de exibição no app (banner na Home? item no sino? card na trilha?).
- Definir segmentação (todos / por cargo / por gerente) e janela de vigência.
- Definir se aviso exige confirmação de leitura (e como isso entra no relatório).

_(Sem screenshot — tela planejada.)_
