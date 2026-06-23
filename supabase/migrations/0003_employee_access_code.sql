-- Adiciona codigo/senha curta de acesso gerada pelo dashboard RH.
alter table employees
  add column if not exists access_code text;

create index if not exists idx_employees_access_code on employees (access_code);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'employees'
      and policyname = 'auth employees write'
  ) then
    create policy "auth employees write" on employees
      for all to authenticated using (true) with check (true);
  end if;
end $$;
