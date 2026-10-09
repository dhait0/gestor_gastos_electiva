-- Obligations table
-- Created: 2026-10-08

create table public.obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  amount numeric(20,4) not null check (amount > 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  due_date date not null,
  status obligation_status not null default 'PENDING',
  source obligation_source not null default 'MANUAL',
  source_id uuid,
  paid_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraint: paid_at must be set when status = PAID
alter table public.obligations
  add constraint obligations_paid_at_when_paid
  check (
    status <> 'PAID'
    or (status = 'PAID' and paid_at is not null)
  );

-- Enable RLS
alter table public.obligations enable row level security;

-- SELECT
create policy "obligations_select_own"
  on public.obligations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "obligations_insert_own"
  on public.obligations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "obligations_update_own"
  on public.obligations
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- updated_at trigger
create trigger obligations_updated_at
  before update on public.obligations
  for each row
  execute function private.set_updated_at();

-- Indexes
create index obligations_user_id_idx on public.obligations (user_id);
create index obligations_user_id_status_due_idx on public.obligations (user_id, status, due_date)
  where deleted_at is null;

-- Unique composite for FK references
create unique index obligations_user_id_id_unique on public.obligations (id, user_id);