-- Profiles table and trigger
-- Created: 2026-10-08

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'America/Bogota',
  safety_reserve numeric(20,4) not null default 0 check (safety_reserve >= 0),
  locale text not null default 'es-CO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- SELECT: users can read their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- UPDATE: users can update their own profile
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- updated_at trigger
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function private.set_updated_at();

-- Trigger function to create profile on signup
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, currency_code, timezone, safety_reserve, locale)
  values (new.id, 'COP', 'America/Bogota', 0, 'es-CO');
  return new;
end;
$$;

-- Attach trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

-- Revoke direct execution of the trigger function
revoke execute on function private.handle_new_user() from public, anon;