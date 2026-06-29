# Wireframe — Avisos (Admin) · 🟡 PLANEJADO (P3)

> **Tela NÃO existe ainda — wireframe de proposta.** Estrutura sugerida, fiel às convenções do CMS (sidebar 248 + topbar + page header + tabela herói).

```
┌────────────┬──────────────────────────────────────────────────────────┐
│  LOGO      │  Boa tarde, Administrador 👋        📅 Sex,26 Jun 16:36 🔔 │ ← sino reflete avisos
│            ├──────────────────────────────────────────────────────────┤
│ Dashboard  │  COMUNICAÇÃO                                               │
│ PESSOAS    │  Avisos                                    [ + Novo aviso ]│ ← header + ação
│  Colabs    │  Publique comunicados que aparecem no app do colaborador. │
│  Gerentes  │  ┌Ativos┐ ┌Agendados┐ ┌Rascunhos┐ ┌Alcance┐               │ ← StatCards
│ CONTEÚDO   │                                                            │
│  Módulos   │  ┌────────────────────────────────────────────────────┐   │
│  Termos    │  │ TÍTULO        PÚBLICO     PERÍODO        STATUS     │   │ ← header tabela
│ COMUNICAÇÃO│  ├────────────────────────────────────────────────────┤   │
│ ▸Avisos    │  │                                                    │   │
│ ANÁLISE    │  │            ╭──────────────────╮                    │   │
│  Relatório │  │            │   📣 (ícone)     │                    │   │ ← EmptyState
│            │  │            │ Nenhum aviso ainda│                   │   │
│            │  │            │ [ Criar o primeiro]│                   │   │
│ ┌────────┐ │  │            ╰──────────────────╯                    │   │
│ │AD Admin│ │  └────────────────────────────────────────────────────┘   │
│ └────────┘ │                                                            │
└────────────┴──────────────────────────────────────────────────────────┘
```

**Zonas (propostas):** Sidebar (novo item "Avisos" — grupo Comunicação/Conteúdo) · Topbar (sino reaproveitado p/ avisos) · PageHeader (eyebrow COMUNICAÇÃO + "Novo aviso") · StatCards (Ativos/Agendados/Rascunhos/Alcance) · Tabela herói (Título/Público/Período/Status) **ou** EmptyState quando vazio. Modal/editor de aviso reusa SlideEditor + chips de público-alvo.
