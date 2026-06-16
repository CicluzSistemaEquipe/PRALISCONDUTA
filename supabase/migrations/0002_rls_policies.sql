-- ============================================================
-- RLS — Pralis Conduta
--
-- O app do colaborador acessa via chave ANON (sem login), usando o
-- token único do link como segredo de acesso. O painel do RH usa o
-- Supabase Auth (usuários autenticados).
--
-- NOTA DE PRODUÇÃO: as políticas abaixo liberam as operações que o app
-- precisa para a role `anon`. Por se tratar de ferramenta interna de
-- onboarding (dados: nome, cargo, telefone), o risco é baixo. Para um
-- isolamento mais forte por colaborador, migre as escritas para funções
-- RPC `security definer` que validem o token no servidor.
-- ============================================================

alter table employees    enable row level security;
alter table progress     enable row level security;
alter table quiz_answers enable row level security;
alter table signatures   enable row level security;
alter table video_views  enable row level security;

-- ---- Colaborador (anon) ----
create policy "anon employees rw" on employees
  for all to anon using (true) with check (true);

create policy "anon progress rw" on progress
  for all to anon using (true) with check (true);

create policy "anon quiz rw" on quiz_answers
  for all to anon using (true) with check (true);

create policy "anon signatures rw" on signatures
  for all to anon using (true) with check (true);

create policy "anon video rw" on video_views
  for all to anon using (true) with check (true);

-- ---- RH (authenticated) ----
create policy "auth employees read" on employees
  for select to authenticated using (true);

create policy "auth progress read" on progress
  for select to authenticated using (true);

create policy "auth quiz read" on quiz_answers
  for select to authenticated using (true);

create policy "auth signatures read" on signatures
  for select to authenticated using (true);

create policy "auth video read" on video_views
  for select to authenticated using (true);
