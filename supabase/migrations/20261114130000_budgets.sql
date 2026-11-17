-- G01: presupuestos mensuales por categoría de gasto
--
-- Cambio aditivo. El consumo del presupuesto NO se persiste: se deriva de las
-- transacciones EXPENSE (sin eliminadas ni transferencias) del mes y categoría.
--
-- Desviación documentada respecto a MODELO_DATOS_Y_SEGURIDAD §33: se añade
-- `deleted_at` (borrado lógico) para poder corregir un presupuesto erróneo sin
-- política DELETE, coherente con el resto del esquema.
--
-- Rollback: drop table public.budgets (sin dependientes).

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null,
  period_month date not null check (extract(day from period_month) = 1),
  limit_amount numeric(20,4) not null check (limit_amount > 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict
);

-- Un único presupuesto activo por usuario, categoría y mes
create unique index budgets_user_category_month_unique
  on public.budgets (user_id, category_id, period_month)
  where deleted_at is null;

create index budgets_user_id_month_idx on public.budgets (user_id, period_month)
  where deleted_at is null;

create unique index budgets_user_id_id_unique on public.budgets (id, user_id);

-- Solo categorías de gasto pueden tener presupuesto
create or replace function private.budget_category_must_be_expense()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.categories c
    where c.id = new.category_id and c.user_id = new.user_id and c.type = 'EXPENSE'
  ) then
    raise exception 'budgets.category_id debe ser una categoría EXPENSE del usuario'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger budgets_category_expense
  before insert or update of category_id on public.budgets
  for each row
  execute function private.budget_category_must_be_expense();

create trigger budgets_updated_at
  before update on public.budgets
  for each row
  execute function private.set_updated_at();

alter table public.budgets enable row level security;

create policy "budgets_select_own"
  on public.budgets for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "budgets_insert_own"
  on public.budgets for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "budgets_update_own"
  on public.budgets for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
