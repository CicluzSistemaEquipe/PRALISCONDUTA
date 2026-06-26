# Relatórios Pro — Relatório final

> Roadmap **B** da evolução administrativa. Branch: `lab/admin-relatorios-pro`.
> **Preservado:** app do colaborador, lógica de treinamento, regras, desbloqueios.
> Tudo local (localStorage), retrocompatível, **Design System do admin preservado**.

**Gate:** `tsc -b` ✅ + `vite build` ✅. Validado visualmente (default + filtros + agrupado).

---

## Objetivo
Transformar a tela de Relatórios (antes: tabela com 1 filtro de status + CSV) em uma
**ferramenta de análise** profissional — filtrar, agrupar, resumir e exportar o
acompanhamento de treinamento e assinaturas.

## O que foi implementado (vs. os 10 pedidos)

| # | Pedido | Entregue |
|---|--------|----------|
| 1 | Filtros combináveis (loja, gerente, cargo, status, período, assinatura, progresso) | ✅ Painel de filtros que se combinam; status via visões rápidas; período = admissão (de/até) |
| 2 | Busca por colaborador | ✅ Busca por nome (com limpar) |
| 3 | Agrupamentos (gerente, loja, cargo, status) | ✅ Seletor "Agrupar por" → seções com cabeçalho (nome + contagem + nº assinaram) |
| 4 | Visões rápidas (pendentes, em andamento, concluídos, falta assinar) | ✅ Chips de status: Todos · Pendentes · Em andamento · Falta assinar · Concluídos |
| 5 | Exportação CSV | ✅ CSV (UTF-8 BOM) **respeitando os filtros**, com colunas ampliadas |
| 6 | Cards de resumo | ✅ Total · Assinaram · Progresso médio · Pendentes (reagem aos filtros) |
| 7 | Empty states claros | ✅ Sem colaboradores / sem resultados (com "Limpar filtros") |
| 8 | Mobile responsivo | ✅ Tabela no desktop, cards no mobile; filtros em grid que colapsa |
| 9 | Relatório final | ✅ este documento |
| 10 | Build verde | ✅ `tsc -b` + `vite build` |

### Detalhes
- **Filtros combináveis** (painel colapsável com contador de ativos): Loja · Gerente ·
  Cargo · Assinatura (assinou/não) · Progresso (0% / 1–99% / 100%) · Admissão (de/até).
  Combinam livremente entre si, com a busca e com a visão rápida (status). Botão "Limpar".
- **CSV** inclui: Nome, CPF, Cargo, Loja, Gerente, Situação, Admissão, Módulos concluídos,
  Total, Progresso %, Status, Assinou, Data assinatura, Quiz %.
- **Clique no colaborador** abre a **visão 360°** (`ColaboradorDetailModal` reusado de
  Colaboradores) — mantém a plataforma interligada e com uma só fonte de verdade.

## Decisão de arquitetura (justificada)
**Mudança de loader, sem alterar fórmulas.** A tela passou a usar `loadEmployeeRows`
(`src/dashboard/data.ts`) — a **mesma** fonte já usada por Colaboradores, Gerentes e
Dashboard — em vez do `loadDetail` local que existia só aqui. Ganho: **uma única fonte de
verdade** para os números do app. O `statusOf` e o `progress = concluídos/total` são
idênticos; a única diferença é que o `loadEmployeeRows` **não conta o módulo de
assinatura** dentro do "total de módulos" (a assinatura é etapa à parte) — o que alinha o
Relatório ao resto do app e corrige uma contagem divergente. Os **cálculos de status e
progresso não mudaram**.

## Telas alteradas
| Arquivo | Mudança |
|---------|---------|
| `src/admin/pages/AdminAcompanhamento.tsx` | Reescrita como Relatórios Pro (filtros, agrupamentos, resumo, CSV, 360°) |

## Decisões de UX/Design
- **Visões rápidas = controle de status** (chips), evitando duplicar um dropdown de status.
- **Filtros avançados em painel colapsável** com **badge de contagem** — tela limpa por
  padrão, poder sob demanda.
- **Período por admissão**: a data sempre presente no cadastro (coorte por tempo de casa);
  a "assinatura" tem filtro próprio (sim/não) e a data de assinatura aparece na linha.
- **Agrupamento com cabeçalho informativo** (contagem + nº de assinaturas) para leitura
  gerencial rápida.
- Tokens e componentes do admin (`adm-card`, `adm-table`, `adm-badge`, `StatusBadge`,
  `EmptyState`, `Skeleton`) reaproveitados — "feito pela mesma equipe".

## Melhorias futuras (registradas)
- **Exportar respeitando o agrupamento** (uma aba/seção por grupo) e **PDF** executivo.
- **Período por data de conclusão/assinatura** além de admissão.
- **Gráficos** (conclusão por loja/gerente ao longo do tempo) — depende da camada de
  analytics (Fase 4 do `docs/IMPLEMENTATION_PLAN.md`).
- **Salvar visões** (filtros nomeados favoritos).

## Nota da plataforma administrativa (revisada): **8,5 / 10**
Com **Relatórios Pro**, a tríade de gestão (**Pessoas + Gerentes + Análise**) está
completa e interligada, no padrão enterprise. O caminho restante para 9+ é a frente de
**Conteúdo** (editor de módulos + preview ao vivo, mídia, Lis visual) — roadmap C/D, parte
dependente da Fase 1 de Supabase/Storage.

## Próximo sugerido
**Roadmap C — Editor de Módulos + Preview ao vivo** (maior salto de produtividade de
conteúdo). Reorganiza o editor e adiciona um celular lateral que renderiza o `StoryPlayer`
real refletindo cada alteração. Detalhado em `docs/DASHBOARD_CONTENT_FLOW.md`.
