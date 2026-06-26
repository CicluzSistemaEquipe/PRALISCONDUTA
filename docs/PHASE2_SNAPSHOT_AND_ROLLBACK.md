# Fase 2 — Snapshot da Arquitetura Atual + Plano de Rollback

> Documento de **segurança** gerado **antes de qualquer migration**. Registra o estado
> exato no início da implementação da Fase 2 e o caminho de volta para cada passo.
>
> **Base (commit):** `5776a68` (branch `lab/phase2-supabase-discovery`, a partir de
> `lab/cms-consolidation`). Tudo abaixo descreve o sistema **neste** ponto.

---

## 1. Snapshot da arquitetura (estado congelado)

### 1.1 Princípio que garante reversibilidade
Todo I/O passa pelo gate **`hasSupabase`** (`src/lib/supabase.ts`): o cliente só existe se
`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` estiverem definidos. **Sem essas variáveis,
o app roda 100% em localStorage** — o estado atual. Logo, o "rollback instantâneo" de
qualquer coisa Supabase é **não definir as env vars**.

### 1.2 Persistência hoje
| Domínio | Fonte | Local |
|---|---|---|
| Conteúdo (módulos/termos/splash) | **localStorage** | chave `pralis_admin_data` (`adminStore.ts`), lido por `content.ts:activeModules()` |
| Colaboradores/progresso/quiz/assinatura/vídeos | localStorage **ou** Supabase (gated) | `storage.ts` (chaves `pralis:*`) / tabelas `0001` |
| Sessão admin | `sessionStorage` `pralis:admin-session` | `admin/auth.ts` |
| Mídia | arquivos em `/public` | servidos estáticos |

### 1.3 Contrato inviolável (linha vermelha)
`Module`/`Story` (`src/lib/types.ts`) consumido por `content.ts` → `modulesForRole()` /
`getModule()` → `StoryPlayer`/`Feed`. `prepareStories()`, desbloqueio (`prevDone`),
progresso, conclusão e assinatura **não mudam** na Fase 2.

### 1.4 Migrations existentes (banco)
- `0001_initial_schema.sql` — employees, progress, quiz_answers, signatures, video_views.
- `0002_rls_policies.sql` — RLS **aberta** (`using(true)`) para anon.
- `0003_employee_access_code.sql` — coluna access_code.
> O schema NÃO tem: `training_modules`, `lis_lines`, `poll_answers`, os campos novos de
> `employees`/`signatures`, nem buckets de Storage. (Ver `PHASE2_SUPABASE_DISCOVERY.md`.)

### 1.5 Build / gates verdes neste ponto
`tsc -b` ✅ · `vite build` ✅ · modo local/demo (`?dev=1`) funcionando · CMS consolidado
(nota 8,5). Reports anteriores em `docs/CMS_CONSOLIDATION_REPORT.md` e
`docs/CONTENT_EDITOR_DISCOVERY.md`.

---

## 2. O que a Fase 2 (P2.0 + P2.1) vai adicionar
Tudo **aditivo e gated** — nenhum arquivo de runtime do colaborador é alterado:
- **Migrations** (arquivos `.sql`, idempotentes): `0004_content`, `0005_schema_drift`,
  `0006_storage`. *(Aplicadas só num projeto Supabase; o repo só guarda os arquivos.)*
- **Código novo:** `src/lib/contentRepo.ts` (fetch/upsert/seed de módulos no Supabase).
- **Código alterado (gated):** `content.ts` (lê um cache hidratado do Supabase quando
  `hasSupabase`, senão idêntico a hoje), `adminStore.ts` (upsert best-effort quando
  `hasSupabase`), um ponto de hidratação no boot.

---

## 3. Plano de Rollback (completo, por nível)

### Nível A — Desligar Supabase (instantâneo, sem código)
1. **Remover/limpar** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do ambiente (`.env`,
   Vercel, etc.) e rebuild.
2. Efeito: `hasSupabase = false` → todo o app volta a ler/escrever **localStorage**, exatamente
   como neste snapshot. Zero perda de funcionalidade local.
3. Limpar o cache de conteúdo local (se quiser estado limpo): `localStorage.removeItem('pralis:content-cache')`.

### Nível B — Reverter o código (git)
1. `git checkout lab/phase2-supabase-discovery` (ou a branch de trabalho da fase).
2. Reverter para o snapshot: `git reset --hard 5776a68` **ou** `git revert <commits da P2.x>`.
3. `main` permanece intocada (todo o trabalho está em branches `lab/*`).
4. Rebuild + validar (`tsc -b`, `vite build`, modo local).

### Nível C — Reverter o banco (Supabase)
As migrations da Fase 2 são **aditivas** (tabelas/colunas/buckets novos). Para desfazer:
```sql
-- Conteúdo (0004)
drop table if exists training_modules cascade;
drop table if exists lis_lines cascade;
drop table if exists poll_answers cascade;
-- Drift (0005) — só se quiser remover as colunas novas (NÃO recomendado se já houver dados)
-- alter table employees  drop column if exists email, drop column if exists whatsapp, ...;
-- alter table signatures drop column if exists terms_version, drop column if exists document_hash, ...;
-- Storage (0006)
-- (Studio) remover os buckets video/audio/image/poster/attachment/lis e suas policies
```
> **Recomendação:** as colunas novas de `0005` são inofensivas se ficarem (campos opcionais).
> Só remover se realmente necessário. **Nunca** dropar tabelas com dados de produção sem backup.

### Nível D — Mídia
Enquanto a P2.2 (mídia) **não** for executada, os assets continuam em `/public` e nada muda.
Quando a P2.2 vier, a referência de cada `Story` (string URL) é reversível: trocar a URL do
Storage de volta para o caminho `/public` (mantemos os binários em `/public` até a migração
estar validada em produção).

### Ordem de rollback recomendada
A (desligar env) → valida → se preciso B (git) → C (banco) só se as tabelas/colunas
incomodarem. Na prática, **A sozinho** já devolve o sistema ao estado deste snapshot.

---

## 4. Critérios de "rollback bem-sucedido"
- [ ] `hasSupabase = false` e o app lê/escreve localStorage (conteúdo aparece, edição salva).
- [ ] `tsc -b` + `vite build` verdes.
- [ ] Modo `?dev=1` e CMS funcionando como no snapshot.
- [ ] Nenhuma referência de mídia quebrada (tudo em `/public`).
- [ ] Contrato `Module`/`Story` intacto (StoryPlayer/Feed inalterados).

---

## 5. Backups antes de aplicar migrations em produção
- **Conteúdo local:** exportar `localStorage['pralis_admin_data']` (JSON) antes de semear o
  Supabase — é a fonte da verdade até a migração.
- **Banco:** snapshot/backup do projeto Supabase (PITR ou `pg_dump`) antes de `0007`
  (hardening de RLS) e antes de qualquer dado real.
