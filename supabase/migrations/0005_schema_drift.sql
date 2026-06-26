-- ============================================================
-- Fase 2 / P2.0 — Alinhar o banco ao código atual (drift de schema)
--
-- Desde 0001-0003, o CÓDIGO passou a gravar campos que NÃO existem nas
-- tabelas. Esta migration cria essas colunas (aditivo, idempotente) para que,
-- quando o Supabase for ligado para employees/signatures (fase posterior),
-- as escritas não quebrem (risco R1 da discovery).
--
-- NOTA (R1): o storage.ts hoje envia algumas chaves em camelCase (ex.:
-- `gerenteId`). Antes de ATIVAR a escrita de employees no Supabase, será
-- preciso um adaptador camelCase→snake_case no storage.ts (ou colunas
-- correspondentes). Aqui adotamos snake_case (convenção Postgres); o
-- adaptador entra junto com a ativação de employees (não nesta fase de
-- conteúdo). Ver checklist do relatório.
-- ============================================================

-- ---- employees: cadastro completo (gestão documental) ----
alter table employees add column if not exists email          text;
alter table employees add column if not exists whatsapp       text;
alter table employees add column if not exists birth_date     date;
alter table employees add column if not exists admission_date date;
alter table employees add column if not exists store          text;
alter table employees add column if not exists status         text default 'ativo';
alter table employees add column if not exists gerente_id     text;     -- AdminUser.id do gerente responsável
alter table employees add column if not exists notes          text;

-- ---- signatures: robustez probatória (Lei 14.063/2020) ----
alter table signatures add column if not exists terms          jsonb;   -- string[] dos termos
alter table signatures add column if not exists terms_version  text;
alter table signatures add column if not exists document_hash  text;    -- SHA-256 do HTML assinado
alter table signatures add column if not exists user_agent     text;
alter table signatures add column if not exists signer_name    text;
alter table signatures add column if not exists signer_cpf     text;
alter table signatures add column if not exists app_version    text;

-- ---- progress: nada a alterar (já cobre story_index/completed). ----
