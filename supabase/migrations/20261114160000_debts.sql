-- K01: deudas y abonos
--
-- Cambio aditivo. A diferencia de otras entidades, `current_balance` SÍ se
-- persiste (intereses, ajustes, refinanciación) y se actualiza de forma atómica
-- junto con cada abono mediante las funciones record_debt_payment() y
-- void_debt_payment(): nunca se escribe desde el cliente de forma suelta.
--
-- Desviación documentada respecto a MODELO_DATOS_Y_SEGURIDAD §33: se añade
-- `deleted_at` a debt_payments para poder corregir un abono erróneo (anularlo
-- revierte el saldo) sin política DELETE.
--
-- Las funciones son SECURITY DEFINER (el cliente no tiene política de
-- INSERT/UPDATE sobre debt_payments) y por eso comprueban explícitamente la
-- propiedad con auth.uid() en cada consulta; usan search_path vacío y solo las
-- puede ejecutar un usuario autenticado.
--
-- Rollback: drop function public.record_debt_payment, public.void_debt_payment;
-- drop table public.debt_payments; drop table public.debts.

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  type debt_type not null default 'OTHER',
  original_amount numeric(20,4) not null check (original_amount > 0),
  current_balance numeric(20,4) not null check (current_balance >= 0),
  currency_code varchar(3) not null default 'COP' check (currency_code ~ '^[A-Z]{3}$'),
  interest_rate_percent numeric(7,4) not null default 0 check (interest_rate_percent >= 0),
  minimum_payment numeric(20,4) not null default 0 check (minimum_payment >= 0),
  payment_day smallint check (payment_day between 1 and 31),
  status debt_status not null default 'ACTIVE',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index debts_user_status_idx on public.debts (user_id, status) where deleted_at is null;
create unique index debts_user_id_id_unique on public.debts (id, user_id);

create trigger debts_updated_at
  before update on public.debts
  for each row
  execute function private.set_updated_at();

alter table public.debts enable row level security;

create policy "debts_select_own"
  on public.debts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "debts_insert_own"
  on public.debts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "debts_update_own"
  on public.debts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  debt_id uuid not null,
  amount numeric(20,4) not null check (amount > 0),
  principal_amount numeric(20,4) not null check (principal_amount >= 0),
  interest_amount numeric(20,4) not null default 0 check (interest_amount >= 0),
  payment_date date not null default current_date,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint debt_payments_split_matches_amount
    check (principal_amount + interest_amount = amount),
  constraint debt_payments_debt_fk
    foreign key (debt_id, user_id)
    references public.debts (id, user_id)
    on delete restrict
);

create index debt_payments_debt_date_idx
  on public.debt_payments (debt_id, payment_date desc)
  where deleted_at is null;
create index debt_payments_user_id_idx on public.debt_payments (user_id);

alter table public.debt_payments enable row level security;

create policy "debt_payments_select_own"
  on public.debt_payments for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sin política de INSERT/UPDATE para el cliente: los abonos solo se crean y
-- anulan por las funciones de abajo, que mantienen el saldo cuadrado.

-- Registra un abono y descuenta del saldo el capital pagado, de forma atómica.
create or replace function public.record_debt_payment(
  p_debt_id uuid,
  p_amount numeric,
  p_interest numeric default 0,
  p_payment_date date default current_date,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_debt public.debts%rowtype;
  v_principal numeric(20,4);
  v_payment_id uuid;
begin
  if v_user is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'El abono debe ser mayor a 0' using errcode = '23514';
  end if;
  if p_interest is null or p_interest < 0 or p_interest > p_amount then
    raise exception 'El interés debe estar entre 0 y el monto del abono' using errcode = '23514';
  end if;

  select * into v_debt
  from public.debts
  where id = p_debt_id and user_id = v_user and deleted_at is null
  for update;

  if not found then
    raise exception 'Deuda no encontrada' using errcode = 'P0002';
  end if;
  if v_debt.status in ('PAID', 'CANCELLED') then
    raise exception 'La deuda no admite abonos' using errcode = '23514';
  end if;

  v_principal := p_amount - p_interest;
  if v_principal > v_debt.current_balance then
    raise exception 'El abono a capital supera el saldo pendiente' using errcode = '23514';
  end if;

  insert into public.debt_payments (user_id, debt_id, amount, principal_amount, interest_amount, payment_date, notes)
  values (v_user, p_debt_id, p_amount, v_principal, p_interest, p_payment_date, p_notes)
  returning id into v_payment_id;

  update public.debts
  set current_balance = current_balance - v_principal,
      status = case when current_balance - v_principal = 0 then 'PAID'::public.debt_status else status end
  where id = p_debt_id and user_id = v_user;

  return v_payment_id;
end;
$$;

-- Anula un abono (borrado lógico) y devuelve el capital al saldo.
create or replace function public.void_debt_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_payment public.debt_payments%rowtype;
begin
  if v_user is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  select * into v_payment
  from public.debt_payments
  where id = p_payment_id and user_id = v_user and deleted_at is null
  for update;

  if not found then
    raise exception 'Abono no encontrado' using errcode = 'P0002';
  end if;

  -- Bloquea la deuda antes de modificar el saldo
  perform 1 from public.debts where id = v_payment.debt_id and user_id = v_user for update;

  update public.debt_payments set deleted_at = now() where id = p_payment_id;

  update public.debts
  set current_balance = current_balance + v_payment.principal_amount,
      status = case when status = 'PAID' then 'ACTIVE'::public.debt_status else status end
  where id = v_payment.debt_id and user_id = v_user;
end;
$$;

-- Las funciones solo las ejecuta un usuario autenticado
revoke execute on function public.record_debt_payment(uuid, numeric, numeric, date, text) from public, anon;
revoke execute on function public.void_debt_payment(uuid) from public, anon;
grant execute on function public.record_debt_payment(uuid, numeric, numeric, date, text) to authenticated;
grant execute on function public.void_debt_payment(uuid) to authenticated;
