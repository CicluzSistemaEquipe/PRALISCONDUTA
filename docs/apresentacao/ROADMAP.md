# Roadmap Visual · Sistema Pralís

> Cada fase é **retrocompatível**, **sem grande refactor**, e mantém a
> **experiência do colaborador intacta**. O localStorage continua de rede de
> segurança durante toda a transição.

---

## Linha do tempo

```
  ✅ FEITO            ◉ AGORA            ○ P2            ○ P3            ○ P4
 ┌──────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐    ┌──────────┐
 │ Produto  │ ──▶ │   P1     │ ──▶ │  Edição  │──▶ │ Avisos & │──▶ │Analytics │
 │  local   │     │ Supabase │     │   rica   │    │   push   │    │          │
 └──────────┘     └──────────┘     └──────────┘    └──────────┘    └──────────┘
  App, admin,      Conteúdo na      Lis áudio/cues,  Comunicados +   Engajamento,
  relatórios,      nuvem + Storage  enquete,         notificações    conclusão,
  editor — 100%    + upload de      versionamento,   no celular      ritmo (LGPD)
  offline          mídia            drag&drop full
```

---

## Estado atual

**✅ Entregue e funcionando (modo local):**
- App do colaborador completo (Home "Trilha Viva", módulos, Lis, quizzes, enquetes, assinatura)
- Admin / CMS (colaboradores, gerentes, editor de conteúdo)
- Relatórios Pro com drill-down **gerente → equipe → colaborador**
- Preview real do módulo no celular dentro do editor
- Rascunho → publicação · enquete (poll)
- PWA com service worker

**🔧 Preparado, aguardando ativação:**
- Migrations `0004–0006` escritas (idempotentes)
- Loader de conteúdo Supabase ↔ cache ↔ fallback (gated por `hasSupabase`)
- Snapshot de arquitetura + plano de rollback completo

---

## Fases detalhadas

| Fase | Objetivo | Entregáveis | Risco |
|------|----------|-------------|-------|
| **P1** | Conteúdo no Supabase | Módulos → JSONB; mídia → Storage; **upload no admin** | Baixo–médio |
| **P2** | Edição rica de módulos | Lis com áudio + cues; enquete; **versionamento/publish**; drag&drop completo | Médio |
| **P3** | Avisos + base de push | Área **Avisos** (CRUD admin + read-only colaborador); `push_subscriptions` + opt-in | Médio |
| **P4** | Analytics | `tracking` → Supabase; **dashboards** de engajamento/conclusão/ritmo; GPS opcional c/ LGPD | Médio |

> **Subfases técnicas já iniciadas (Fase 2 interna):** `P2.0` migrations base e
> `P2.1` loader de conteúdo gated — ambas validadas (build, tsc, modo local intacto)
> e **pausadas a pedido** para esta rodada de ajustes de produto.

---

## O que o roadmap recusa

- Transformar o app do colaborador em rede social.
- Empilhar features "porque é legal".
- Refatoração grande sem ganho nomeável.
- Coletar dado "por via das dúvidas" (privacidade desde o desenho).

---

## Princípios de escala

- **Conteúdo orientado a dados** — centenas de treinamentos viram registros, não código.
- **Costuras estáveis** — `enviarNotificacao()` e `registrarEvento()` evoluem; quem chama nunca muda.
- **PWA multiplataforma** — o mesmo app cobre Android, iOS e web.
- **Retrocompatibilidade por fase** — nenhuma fase é big-bang.
- **Contrato do colaborador congelado** — `Module`/`Story` preservados.

---

*Para o detalhamento completo: `docs/FUTURE_ROADMAP.md` e `docs/PHASE2_SUPABASE_DISCOVERY.md`.*
