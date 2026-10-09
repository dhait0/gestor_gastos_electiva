-- Accounts and Categories tables
-- Created: 2026-10-08

-- Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type account_type not null,
  opening_balance numeric(20,4) not null default 0,
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  color text,
  icon text,
  credit_limit numeric(20,4),
  payment_due_day smallint check (payment_due_day between 1 and 31),
  statement_closing_day smallint check (statement_closing_day between 1 and 31),
  is_archived boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraints for credit card specific fields
alter table public.accounts
  add constraint accounts_credit_fields_null_if_not_credit_card
  check (
    type = 'CREDIT_CARD'
    or (
      credit_limit is null
      and payment_due_day is null
      and statement_closing_day is null
    )
  );

alter table public.accounts
  add constraint accounts_credit_limit_positive
  check (credit_limit is null or credit_limit > 0);

-- Enable RLS
alter table public.accounts enable row level security;

-- SELECT
create policy "accounts_select_own"
  on public.accounts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "accounts_insert_own"
  on public.accounts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "accounts_update_own"
  on public.accounts
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- updated_at trigger
create trigger accounts_updated_at
  before update on public.accounts
  for each row
  execute function private.set_updated_at();

-- Indexes
create index accounts_user_id_idx on public.accounts (user_id);
create index accounts_user_id_type_idx on public.accounts (user_id, type);
create index accounts_user_id_archived_idx on public.accounts (user_id, is_archived)
  where deleted_at is null;

-- Unique composite for FK references
create unique index accounts_user_id_id_unique on public.accounts (id, user_id);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type category_type not null,
  icon text,
  color text,
  is_default boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- SELECT
create policy "categories_select_own"
  on public.categories
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "categories_insert_own"
  on public.categories
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "categories_update_own"
  on public.categories
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- updated_at trigger
create trigger categories_updated_at
  before update on public.categories
  for each row
  execute function private.set_updated_at();

-- Indexes
create index categories_user_id_idx on public.categories (user_id);
create index categories_user_id_type_idx on public.categories (user_id, type);

-- Unique partial index for active categories per user/type/name
create unique index categories_user_type_name_unique
  on public.categories (user_id, type, lower(name))
  where deleted_at is null;

-- Unique composite for FK references
create unique index categories_user_id_id_unique on public.categories (id, user_id);