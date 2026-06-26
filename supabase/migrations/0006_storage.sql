-- ============================================================
-- Fase 2 / P2.0 — Buckets de mídia (Supabase Storage)
--
-- Cria os buckets. Conteúdo de treinamento é não-sensível → buckets PÚBLICOS
-- (read) com Cache-Control imutável definido no upload; `attachment` é PRIVADO
-- (PDFs/materiais) e será servido via signed URL.
--
-- Idempotente. As policies de Storage de ESCRITA (upload só por admin
-- autenticado) entram no hardening (0007), junto com o RLS de conteúdo.
-- Até lá, manter fora de dados reais.
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('video',      'video',      true),
  ('audio',      'audio',      true),
  ('image',      'image',      true),
  ('poster',     'poster',     true),
  ('lis',        'lis',        true),
  ('attachment', 'attachment', false)
on conflict (id) do nothing;

-- Leitura pública dos buckets públicos (anon + authenticated).
-- (Buckets `public=true` já servem via /object/public, mas deixamos a policy
--  explícita para o caso de leitura autenticada/listagem.)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'public media read'
  ) then
    create policy "public media read" on storage.objects
      for select
      using (bucket_id in ('video','audio','image','poster','lis'));
  end if;
end $$;

-- `attachment` (privado): sem policy de leitura pública — acesso só via signed
-- URL gerada no servidor/admin. Policies de upload/escrita: ver 0007.
