# Fase 2 — Relatório de Progresso

> Relatório técnico por sub-fase. Branch `lab/phase2-supabase-discovery`.
> Pré-requisitos entregues antes de qualquer migration:
> `docs/PHASE2_SNAPSHOT_AND_ROLLBACK.md` (snapshot + rollback completo).

---

## P2.0 — Migrations base ✅

**Escopo:** criar os arquivos de migration (idempotentes, aditivos) — **sem ligar no app**.
Nenhum código de runtime alterado.

### Entregue
- `supabase/migrations/0004_content.sql` — `training_modules` (JSONB `content` = `Module`),
  `lis_lines` (Lis reutilizável, preparado p/ P2.3), `poll_answers` (enquete). Índices por
  seção/ordem e status. **RLS desta migration deixada para o hardening (0007)** de propósito.
- `supabase/migrations/0005_schema_drift.sql` — alinha o banco ao código atual: colunas
  novas em `employees` (email, whatsapp, birth_date, admission_date, store, status,
  gerente_id, notes) e em `signatures` (terms, terms_version, document_hash, user_agent,
  signer_name, signer_cpf, app_version). **Mitiga R1.**
- `supabase/migrations/0006_storage.sql` — buckets `video/audio/image/poster/lis` (públicos)
  e `attachment` (privado) + policy de leitura pública; escrita/upload fica no 0007.

### Validação
- `tsc -b` ✅ · `vite build` ✅ (migrations são arquivos inertes — confirmam que nada quebrou).
- **Modo local intacto:** nenhuma env var Supabase definida → `hasSupabase=false` → app
  segue 100% localStorage.
- **Contrato `Module`/`Story`:** inalterado (nenhum tipo/loader tocado nesta sub-fase).

### Notas / pendências assumidas
- **R1 (camelCase):** `0005` usa snake_case (convenção Postgres). Antes de ATIVAR a escrita
  de `employees` no Supabase (fase posterior), o `storage.ts` precisa de um adaptador
  camelCase→snake_case (ex.: `gerenteId`→`gerente_id`). **Não** afeta P2.1 (conteúdo).
- **R2 (RLS):** `training_modules` ainda sem RLS — projeto Supabase deve ficar **fora de
  dados reais** até o `0007`. Documentado.

### Como aplicar (quando houver projeto Supabase)
`supabase db push` (CLI) **ou** colar os `.sql` no SQL Editor, na ordem 0004 → 0005 → 0006.
Rollback: ver `PHASE2_SNAPSHOT_AND_ROLLBACK.md` §3 (Nível C).

---
