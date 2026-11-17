-- I01: movimientos recurrentes
--
-- Cambio aditivo. Una recurrencia describe un ingreso o gasto periódico; los
-- movimientos reales se generan como filas de `transactions` enlazadas por
-- `recurring_transaction_id`. `is_automatic` nunca ejecuta pagos externos: solo
-- registra un movimiento interno.
--
-- Idempotencia garantizada en base de datos: no puede existir dos veces el
-- mismo (recurrencia, fecha) activo en `transactions`.
--
-- `start_date` es el ancla del calendario: las fechas se calculan siempre desde
-- ella (inicio + n períodos), de modo que un día 31 no "deriva" a 28 tras pasar
-- por febrero.
--
-- Rollback: drop index transactions_recurring_occurrence_unique;
-- alter table transactions drop constraint transactions_recurring_fk;
-- drop table public.recurring_transactions.

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type category_type not null,
  amount numeric(20,4) not null check (amount > 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  account_id uuid not null,
  category_id uuid not null,
  frequency frequency not null,
  custom_interval_days smallint,
  start_date date not null,
  next_execution_date date not null,
  is_automatic boolean not null default false,
  status recurring_status not null default 'ACTIVE',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_account_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete restrict,
  constraint recurring_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict,
  constraint recurring_custom_interval_rules
    check (
      (frequency = 'CUSTOM' and custom_interval_days is not null and custom_interval_days > 0)
      or (frequency <> 'CUSTOM' and custom_interval_days is null)
    ),
  constraint recurring_next_not_before_start
    check (next_execution_date >= start_date)
);

create index recurring_user_status_next_idx
  on public.recurring_transactions (user_id, status, next_execution_date)
  where deleted_at is null;

create unique index recurring_user_id_id_unique on public.recurring_transactions (id, user_id);

-- La categoría debe ser del mismo tipo que la recurrencia (INCOME/EXPENSE)
create or replace function private.recurring_category_matches_type()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.categories c
    where c.id = new.category_id and c.user_id = new.user_id and c.type = new.type
  ) then
    raise exception 'recurring_transactions.category_id debe ser una categoría del mismo tipo del usuario'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger recurring_category_type
  before insert or update of category_id, type on public.recurring_transactions
  for each row
  execute function private.recurring_category_matches_type();

create trigger recurring_updated_at
  before update on public.recurring_transactions
  for each row
  execute function private.set_updated_at();

alter table public.recurring_transactions enable row level security;

create policy "recurring_select_own"
  on public.recurring_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "recurring_insert_own"
  on public.recurring_transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "recurring_update_own"
  on public.recurring_transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Vincular transactions.recurring_transaction_id (columna que existía sin FK)
alter table public.transactions
  add constraint transactions_recurring_fk
  foreign key (recurring_transaction_id, user_id)
  references public.recurring_transactions (id, user_id)
  on delete restrict;

-- Idempotencia: una sola ocurrencia activa por recurrencia y fecha
create unique index transactions_recurring_occurrence_unique
  on public.transactions (recurring_transaction_id, transaction_date)
  where recurring_transaction_id is not null and deleted_at is null;
