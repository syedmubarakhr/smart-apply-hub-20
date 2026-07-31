create type public.company_status as enum ('active','suspended');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  login_id text not null,
  country text not null default '',
  timezone text not null default 'UTC',
  logo_url text,
  status public.company_status not null default 'active',
  admin_name text not null default '',
  admin_email text not null default '',
  auth_user_id uuid,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.companies to authenticated;
grant all on public.companies to service_role;

alter table public.companies enable row level security;

create policy "developers manage companies" on public.companies
for all to authenticated
using (public.has_role(auth.uid(), 'developer'))
with check (public.has_role(auth.uid(), 'developer'));

create policy "company can view own company" on public.companies
for select to authenticated
using (auth_user_id = auth.uid());

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create index companies_status_idx on public.companies (status);
create index companies_name_idx on public.companies (name);