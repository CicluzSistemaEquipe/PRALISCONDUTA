# Wireframe — Relatórios (Admin)

```
┌────────────┬──────────────────────────────────────────────────────────┐
│  LOGO      │  Boa tarde, Administrador 👋        📅 Sex,26 Jun 16:36 🔔 │
│            ├──────────────────────────────────────────────────────────┤
│ Dashboard  │  ANÁLISE                                                   │
│ PESSOAS    │  Relatórios                              [ ⤓ Exportar CSV ]│ ← header + ação
│  Colabs    │  Filtre, agrupe e exporte o acompanhamento.               │
│  Gerentes  │  ┌1 Colabs┐ ┌0 Assinar┐ ┌0% Progr.┐ ┌1 Pendentes┐         │ ← 4 StatCards
│ CONTEÚDO   │  (Todos)(Pendentes)(Em andam.)(Falta assinar)(Concluídos) │ ← chips
│  Módulos   │  ┌────────────────────────────────────┐ [ ☰ Filtros ]    │
│  Termos    │  │ 🔍 Buscar por nome…                │                   │
│ ANÁLISE    │  [ Sem agrupamento ▾ ]                                     │ ← dropdown
│ ▸Relatório │  ┌────────────────────────────────────────────────────┐   │
│            │  │ COLABORADOR  LOJA  GERENTE  PROGRESSO ASSINOU STATUS│   │
│            │  ├────────────────────────────────────────────────────┤   │
│            │  │ BA Beatriz   —     —    ▓▓░ 0/8   Não    Pendente   │   │
│ ┌────────┐ │  └────────────────────────────────────────────────────┘   │
│ │AD Admin│ │         Mostrando 1 de 1 colaboradores                    │
│ └────────┘ │                                                            │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Zonas:** Sidebar · Topbar · PageHeader (+ Exportar CSV) · 4 StatCards · barra de filtros (chips de status + busca + Filtros + dropdown de agrupamento) · Tabela herói · contador de resultados.
