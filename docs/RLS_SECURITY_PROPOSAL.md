# Proposta de RLS / Policies Seguras — Pralís (NÃO APLICAR ainda)

> **Status: PROPOSTA ESCRITA.** Nada aqui foi aplicado. Nenhuma migration nova foi
> criada. Serve para revisão e para virar a migration `0007_hardening` **quando você
> aprovar**. A Opção A (teste sem Supabase) **não depende disto**.

---

## 1. Estado atual (o que está inseguro)

A migration **`0002_rls_policies.sql`** habilita RLS mas com políticas **totalmente
abertas** para a role `anon`:

```sql
create policy "anon employees rw" on employees
  for all to anon using (true) with check (true);
-- idem: progress, quiz_answers, signatures, video_views
```

**Problema:** a `ANON_KEY` é **pública** (vai no bundle do front). Com essas policies,
qualquer pessoa com a key pode **ler, alterar e apagar TODOS** os registros
(nomes, telefones, progresso, assinaturas). A própria migration reconhece o risco e
sugere RPC `security definer`.

**Outros pontos:**
- `training_modules` (0004) ainda **sem RLS** (conteúdo).
- Storage (0006): leitura pública OK, mas **sem policy de escrita** (upload) — e sem
  UI de upload no código ainda.
- Admin Auth é **demo client-side** (senha no bundle), não Supabase Auth.
- **Drift camelCase↔snake_case** em `storage.ts` precisa ser corrigido **antes** de
  ativar escrita de `employees` online (senão updates falham).

---

## 2. Modelo de segurança proposto

### Princípio
O app do colaborador **não tem login** — ele se identifica pelo **token único** do
link (`/acesso?mat=...`). RLS sozinha não valida esse token (anon não tem identidade).
A forma correta é **fechar o acesso direto às tabelas** e expor apenas **funções RPC
`security definer`** que validam o token no servidor.

```
Colaborador (anon)  ──► RPC security definer (valida token) ──► tabelas
Admin/RH            ──► Supabase Auth (authenticated + role) ──► tabelas (leitura/escrita)
```

### 2.1 Colaborador — substituir acesso direto por RPC
- **Revogar** as policies `anon ... rw` abertas.
- Criar funções `security definer` que recebem o `token` e só operam nas linhas
  daquele colaborador. Ex.:

```sql
-- PROPOSTA — não aplicar até aprovação
create or replace function rpc_save_progress(p_token text, p_module text,
                                             p_story int, p_completed bool)
returns void language plpgsql security definer set search_path = public as $$
declare v_emp uuid;
begin
  select id into v_emp from employees where token = p_token;
  if v_emp is null then raise exception 'token inválido'; end if;
  insert into progress (employee_id, module_id, story_index, completed, completed_at)
  values (v_emp, p_module, p_story, p_completed, case when p_completed then now() end)
  on conflict (employee_id, module_id)
    do update set story_index = excluded.story_index,
                  completed = excluded.completed,
                  completed_at = excluded.completed_at;
end $$;

revoke all on function rpc_save_progress(text,text,int,bool) from public;
grant execute on function rpc_save_progress(text,text,int,bool) to anon;
```

- RPCs equivalentes para: `getEmployeeByToken`, `saveQuizAnswer`, `markVideoWatched`,
  `saveSignature`, `getProgress/quiz/videos/signature` (somente do próprio token).
- **Resultado:** anon não acessa tabela nenhuma diretamente; só chama RPCs que
  validam o token. Vazamento/varredura de dados deixa de ser possível.

> Alternativa mais leve (se RPC for muito agora): manter acesso direto mas **só
> `insert`/`select` por token via policy** — porém policies não conseguem ler o token
> do request com segurança sem RPC/JWT custom. **RPC é o caminho recomendado.**

### 2.2 Admin / RH — Supabase Auth
- Migrar o login admin para **Supabase Auth** (substitui a senha demo no bundle).
- Policies para `authenticated`:
  - **Dono:** leitura/escrita total.
  - **Gerente:** leitura/escrita restrita à própria equipe (via `gerente_id`).
- Guardar `role` em `auth.users` (app_metadata) ou tabela `admin_users` espelhada.

```sql
-- PROPOSTA — exemplo de leitura restrita por gerente
create policy "gerente le sua equipe" on employees
  for select to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'dono'
    or gerente_id = (auth.jwt() -> 'app_metadata' ->> 'admin_id')
  );
```

### 2.3 Conteúdo (`training_modules`)
```sql
-- PROPOSTA
alter table training_modules enable row level security;
-- leitura pública só do publicado e ativo
create policy "public le conteudo publicado" on training_modules
  for select using (active = true and status = 'published');
-- escrita só admin autenticado
create policy "admin escreve conteudo" on training_modules
  for all to authenticated using (true) with check (true);
```

### 2.4 Storage (uploads) — `0007`
- **Leitura:** manter pública nos buckets `video/audio/image/poster/lis` (já em 0006).
- **Escrita/upload:** só `authenticated` (admin):

```sql
-- PROPOSTA
create policy "admin sobe midia" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('video','audio','image','poster','lis'));
create policy "admin atualiza/remove midia" on storage.objects
  for all to authenticated
  using (bucket_id in ('video','audio','image','poster','lis'));
```
- **`attachment` (privado):** sem leitura pública; servir por **signed URL** gerada no
  servidor/admin.

### 2.5 Enquetes (`poll_answers`)
- Hoje só localStorage. Ao ativar online: gravar via RPC por token (como 2.1), com
  `unique(employee_id, module_id, question)`.

---

## 3. Formatos de mídia recomendados (para quando o upload entrar)
| Tipo | Formato | Observação |
|---|---|---|
| Vídeo de treinamento | **MP4 (H.264/AAC)** | compatibilidade máxima; ~720p, bitrate enxuto |
| Vídeo de treinamento (otim.) | WebM (VP9) | opcional, menor peso |
| Vídeo da Lis (transparência) | **WebM com alpha (VP9)** | personagem sobre fundo |
| Thumbnails / pôster | **WebP** (fallback JPG) | carregamento rápido |
| Imagens | **WebP/AVIF** quando possível | senão PNG/JPG otimizado |
| Documentos | **PDF** (bucket `attachment`, privado) | signed URL |

Buckets a usar (já criados no 0006): `video`, `audio`, `image`, `poster`, `lis`
(públicos) e `attachment` (privado).

---

## 4. Pré-condições antes de ligar a escrita online (importante)
1. **Corrigir o drift camelCase→snake_case** em `src/lib/storage.ts`:
   - `createEmployee`/`updateEmployee`: mapear `gerenteId→gerente_id`, e enviar os
     campos novos (`email`, `whatsapp`, `birth_date`, `admission_date`, `store`,
     `status`, `notes`).
   - `saveSignature`: enviar campos probatórios (`terms`, `terms_version`,
     `document_hash`, etc.).
2. Adicionar caminho Supabase para **enquetes** (poll) via RPC.
3. Só então aplicar `0007` e popular com dados.

---

## 5. Ordem de aplicação proposta (quando aprovado)
1. Criar projeto Supabase (sem dados reais).
2. Aplicar `0001→0006`.
3. Revisar e aplicar **`0007_hardening`** (RPCs + RLS de conteúdo + policies de Storage).
4. Migrar admin para Supabase Auth.
5. Corrigir drift no `storage.ts`.
6. Testar com dados **falsos**; só então considerar dados reais.

---

> **Reforço:** esta é uma **proposta**. Nenhuma policy, migration ou RLS foi aplicada
> ou alterada. Aguardo sua aprovação para transformar em `0007_hardening` na etapa de
> Supabase (Opção B / produção).
