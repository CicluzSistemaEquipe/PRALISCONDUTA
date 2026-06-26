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

## P2.1 — Loader de conteúdo (Supabase ↔ cache ↔ fallback) ✅

**Escopo:** ligar a leitura/escrita de **módulos** ao Supabase, mantendo o runtime
**síncrono** e o modo local intacto. Tudo gated por `hasSupabase`.

### Entregue
- **`src/lib/contentRepo.ts` (novo):** `fetchPublishedModules()`, `hydrateContentCache()`
  (Supabase → cache `pralis:content-cache`), `syncModules()`/`seedModulesToSupabase()`
  (upsert em `training_modules` + atualiza o cache), `readContentCache()` (leitura síncrona).
  No-op sem env vars.
- **`content.ts`:** `activeModules()` prioriza o **cache hidratado** quando `hasSupabase`;
  senão, comportamento atual (lê `pralis_admin_data` → `MODULES`). Mesmo `prepareStories`,
  mesmo filtro `active!==false && status!=='draft'`, mesmo `Module[]` de saída.
- **`adminStore.ts`:** `persist()` espelha os módulos no Supabase (`void syncModules`) —
  edição do admin sobe para a nuvem e atualiza o cache. Best-effort, no-op sem Supabase.
- **`App.tsx`:** `hydrateContentCache()` no boot (no-op sem Supabase).
- **`0004` ajustado:** `"order"` → `sort_order` (evita a palavra reservada no PostgREST).

### Validação
- `tsc -b` ✅ · `vite build` ✅.
- **Modo local (sem env vars):** Feed renderiza os módulos normalmente, **zero erros** de
  console/runtime — `contentRepo` é no-op e `content.ts` segue lendo local/`MODULES`.
- **Contrato `Module`/`Story`:** inalterado — `activeModules()` devolve o mesmo `Module[]`;
  StoryPlayer/Feed/`prepareStories`/desbloqueio **não foram tocados**.

### Comportamento quando o Supabase for ligado (gated, code-complete)
- App lê de `pralis:content-cache`, hidratado de `training_modules` (published + active,
  ordenado por `sort_order`); offline-first com fallback para local/`MODULES`.
- Edição no admin → upsert no Supabase + cache atualizado. **Seed inicial:**
  `seedModulesToSupabase(getAdminData().modules)` (idempotente por `id`).

### Pendências assumidas (documentadas)
- **Teste end-to-end com Supabase real:** depende de criar o projeto, aplicar `0004–0006`,
  definir `VITE_SUPABASE_*` e rodar o seed — passo do usuário/infra. O código está
  **completo e gated**; aqui validamos que **não quebra** e o local segue idêntico.
- **R3 (reatividade):** o conteúdo recém-sincronizado aparece no próximo `read`/reload
  (offline-first). Forçar re-render imediato após o hydrate é refino de uma sub-fase futura.
- **R6 (multi-admin):** merge concorrente fica para a frente; hoje, fonte = último upsert.

### Como validar com um projeto Supabase (checklist)
- [ ] Aplicar `0004_content`, `0005_schema_drift`, `0006_storage`.
- [ ] Definir `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; rebuild.
- [ ] Rodar `seedModulesToSupabase(...)` uma vez (ou salvar um módulo no admin).
- [ ] App lê os módulos da nuvem; sem env vars, volta ao local sem erro.
- [ ] `tsc -b` + `vite build` verdes nos 2 modos; Home/treinamento sem regressão.
