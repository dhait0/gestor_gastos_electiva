-- H01: metas de ahorro y sus aportes
--
-- Cambio aditivo. `current_amount` y la recomendación mensual NO se persisten:
-- current = initial_amount + Σ aportes activos. Un aporte no crea movimiento
-- bancario (UC-27).
--
-- Desviación documentada respecto a MODELO_DATOS_Y_SEGURIDAD §33: se añade
-- `deleted_at` a goal_contributions para poder corregir un aporte erróneo sin
-- política DELETE.
--
-- El enum goal_status ya existe (migración base).
--
-- Rollback: drop table public.goal_contributions; drop table public.goals;

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  description text,
  target_amount numeric(20,4) not null check (target_amount > 0),
  initial_amount numeric(20,4) not null default 0 check (initial_amount >= 0),
  monthly_commitment_amount numeric(20,4) not null default 0 check (monthly_commitment_amount >= 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  target_date date,
  status goal_status not null default 'ACTIVE',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_status_idx on public.goals (user_id, status)
  where deleted_at is null;
create unique index goals_user_id_id_unique on public.goals (id, user_id);

create trigger goals_updated_at
  before update on public.goals
  for each row
  execute function private.set_updated_at();

alter table public.goals enable row level security;

create policy "goals_select_own"
  on public.goals for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
  on public.goals for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
  on public.goals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid not null,
  amount numeric(20,4) not null check (amount > 0),
  contribution_date date not null default current_date,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_contributions_goal_fk
    foreign key (goal_id, user_id)
    references public.goals (id, user_id)
    on delete restrict
);

create index goal_contributions_goal_date_idx
  on public.goal_contributions (goal_id, contribution_date desc)
  where deleted_at is null;
create index goal_contributions_user_id_idx on public.goal_contributions (user_id);

create trigger goal_contributions_updated_at
  before update on public.goal_contributions
  for each row
  execute function private.set_updated_at();

alter table public.goal_contributions enable row level security;

create policy "goal_contributions_select_own"
  on public.goal_contributions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "goal_contributions_insert_own"
  on public.goal_contributions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "goal_contributions_update_own"
  on public.goal_contributions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
