-- Transactions table (ledger)
-- Created: 2026-10-08

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null,
  category_id uuid,
  type transaction_type not null,
  direction transaction_direction not null,
  amount numeric(20,4) not null check (amount > 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  description text not null check (length(trim(description)) > 0),
  transaction_date date not null,
  notes text,
  recurring_transaction_id uuid,
  transfer_group_id uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Composite foreign keys for ownership integrity
alter table public.transactions
  add constraint transactions_account_fk
  foreign key (account_id, user_id)
  references public.accounts (id, user_id)
  on delete restrict;

alter table public.transactions
  add constraint transactions_category_fk
  foreign key (category_id, user_id)
  references public.categories (id, user_id)
  on delete set null;

-- Constraints for transaction types
alter table public.transactions
  add constraint transactions_income_rules
  check (
    type <> 'INCOME'
    or (direction = 'INFLOW' and category_id is not null)
  );

alter table public.transactions
  add constraint transactions_expense_rules
  check (
    type <> 'EXPENSE'
    or (direction = 'OUTFLOW' and category_id is not null)
  );

alter table public.transactions
  add constraint transactions_transfer_rules
  check (
    type <> 'TRANSFER'
    or (
      category_id is null
      and transfer_group_id is not null
      and (
        (direction = 'INFLOW' and account_id is not null)
        or (direction = 'OUTFLOW' and account_id is not null)
      )
    )
  );

-- Enable RLS
alter table public.transactions enable row level security;

-- SELECT
create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT
create policy "transactions_insert_own"
  on public.transactions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE
create policy "transactions_update_own"
  on public.transactions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- updated_at trigger
create trigger transactions_updated_at
  before update on public.transactions
  for each row
  execute function private.set_updated_at();

-- Indexes
create index transactions_user_id_idx on public.transactions (user_id);
create index transactions_user_id_date_desc_idx on public.transactions (user_id, transaction_date desc);
create index transactions_user_id_account_date_idx on public.transactions (user_id, account_id, transaction_date desc)
  where deleted_at is null;
create index transactions_user_id_category_date_idx on public.transactions (user_id, category_id, transaction_date desc)
  where deleted_at is null;
create index transactions_transfer_group_idx on public.transactions (transfer_group_id);

-- Unique composite for FK references
create unique index transactions_user_id_id_unique on public.transactions (id, user_id);