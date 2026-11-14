-- J01: suscripciones
--
-- Cambio aditivo. El costo mensual/anual equivalente y la próxima renovación se
-- derivan; no se persisten. Una suscripción NO genera movimientos ni
-- obligaciones por sí sola (evita el doble conteo descrito en el modelo §19):
-- si el usuario quiere registrar el pago como movimiento, lo enlaza a una
-- recurrencia (`recurring_transaction_id`).
--
-- `source` es texto libre (por ejemplo MANUAL) según el modelo §27.
--
-- Rollback: drop table public.subscriptions.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  amount numeric(20,4) not null check (amount > 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  category_id uuid,
  recurring_transaction_id uuid,
  frequency frequency not null,
  custom_interval_days smallint,
  next_payment_date date not null,
  status recurring_status not null default 'ACTIVE',
  source text not null default 'MANUAL' check (length(trim(source)) > 0),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict,
  constraint subscriptions_recurring_fk
    foreign key (recurring_transaction_id, user_id)
    references public.recurring_transactions (id, user_id)
    on delete restrict,
  constraint subscriptions_custom_interval_rules
    check (
      (frequency = 'CUSTOM' and custom_interval_days is not null and custom_interval_days > 0)
      or (frequency <> 'CUSTOM' and custom_interval_days is null)
    )
);

create index subscriptions_user_status_next_idx
  on public.subscriptions (user_id, status, next_payment_date)
  where deleted_at is null;

create unique index subscriptions_user_id_id_unique on public.subscriptions (id, user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function private.set_updated_at();

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "subscriptions_insert_own"
  on public.subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "subscriptions_update_own"
  on public.subscriptions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
