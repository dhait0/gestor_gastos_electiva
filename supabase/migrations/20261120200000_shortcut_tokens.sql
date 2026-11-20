-- Atajos del iPhone: tokens personales para registrar movimientos desde la app Atajos.
-- Un token solo permite CREAR gastos/ingresos del dueño y listar los nombres de sus cuentas y categorías:
-- no lee movimientos ni saldos. Se guarda únicamente el hash SHA-256 del token.
-- Aditiva: no modifica tablas existentes. Rollback: drop function public.shortcut_register_movement,
-- public.shortcut_options, private.shortcut_user; drop table public.shortcut_events, public.shortcut_tokens;
-- Created: 2026-11-20

create table public.shortcut_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  token_prefix text not null check (length(token_prefix) = 8),
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index shortcut_tokens_user_idx on public.shortcut_tokens (user_id, created_at desc);

alter table public.shortcut_tokens enable row level security;

create policy "shortcut_tokens_select_own"
  on public.shortcut_tokens for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "shortcut_tokens_insert_own"
  on public.shortcut_tokens for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Solo se puede revocar (sin DELETE: queda el rastro de qué tokens existieron).
create policy "shortcut_tokens_update_own"
  on public.shortcut_tokens for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.shortcut_tokens from anon, authenticated;
grant select, insert on public.shortcut_tokens to authenticated;
grant update (revoked_at) on public.shortcut_tokens to authenticated;

-- Claves de idempotencia: un atajo que se dispara dos veces no duplica el movimiento.
create table public.shortcut_events (
  user_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key text not null check (length(idempotency_key) between 1 and 100),
  transaction_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);

-- Sin políticas ni permisos: solo las funciones de abajo (security definer) lo tocan.
alter table public.shortcut_events enable row level security;
revoke all on public.shortcut_events from anon, authenticated;

-- Usuario dueño de un token activo; anota el uso. Lanza INVALID_TOKEN si no existe o está revocado.
create or replace function private.shortcut_user(p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  update public.shortcut_tokens
     set last_used_at = now()
   where token_hash = p_token_hash
     and revoked_at is null
  returning user_id into v_user;

  if v_user is null then
    raise exception 'INVALID_TOKEN';
  end if;
  return v_user;
end;
$$;

revoke all on function private.shortcut_user(text) from public, anon, authenticated;

-- Nombres de cuentas y categorías del dueño del token (para armar listas en el atajo).
create or replace function public.shortcut_options(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := private.shortcut_user(p_token_hash);
begin
  return jsonb_build_object(
    'cuentas', coalesce((
      select jsonb_agg(jsonb_build_object('nombre', a.name, 'moneda', a.currency_code) order by a.name)
        from public.accounts a
       where a.user_id = v_user and a.deleted_at is null and not a.is_archived
    ), '[]'::jsonb),
    'categorias_gasto', coalesce((
      select jsonb_agg(c.name order by c.name)
        from public.categories c
       where c.user_id = v_user and c.deleted_at is null and c.type = 'EXPENSE'
    ), '[]'::jsonb),
    'categorias_ingreso', coalesce((
      select jsonb_agg(c.name order by c.name)
        from public.categories c
       where c.user_id = v_user and c.deleted_at is null and c.type = 'INCOME'
    ), '[]'::jsonb)
  );
end;
$$;

-- Registra un gasto o ingreso. Errores con mensaje estable (INVALID_TOKEN, INVALID_TYPE, INVALID_AMOUNT,
-- INVALID_DESCRIPTION, INVALID_DATE, ACCOUNT_REQUIRED, ACCOUNT_NOT_FOUND, ACCOUNT_AMBIGUOUS,
-- CATEGORY_REQUIRED, CATEGORY_NOT_FOUND) que el servidor traduce a texto para la persona.
create or replace function public.shortcut_register_movement(
  p_token_hash text,
  p_type text,
  p_amount numeric,
  p_description text default null,
  p_account text default null,
  p_category text default null,
  p_date date default null,
  p_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := private.shortcut_user(p_token_hash);
  v_type public.transaction_type;
  v_account public.accounts%rowtype;
  v_category public.categories%rowtype;
  v_count integer;
  v_tz text;
  v_today date;
  v_date date;
  v_description text;
  v_tx uuid;
  v_existing uuid;
begin
  if upper(coalesce(p_type, '')) not in ('EXPENSE', 'INCOME') then
    raise exception 'INVALID_TYPE';
  end if;
  v_type := upper(p_type)::public.transaction_type;

  if p_amount is null or p_amount <= 0 or p_amount > 1000000000000 then
    raise exception 'INVALID_AMOUNT';
  end if;

  v_description := nullif(trim(coalesce(p_description, '')), '');
  if v_description is null then
    v_description := case when v_type = 'EXPENSE' then 'Gasto rápido' else 'Ingreso rápido' end;
  end if;
  if length(v_description) > 200 then
    raise exception 'INVALID_DESCRIPTION';
  end if;

  select coalesce(timezone, 'America/Bogota') into v_tz from public.profiles where id = v_user;
  v_today := (now() at time zone coalesce(v_tz, 'America/Bogota'))::date;
  v_date := coalesce(p_date, v_today);
  if v_date > v_today + 1 or v_date < v_today - 3650 then
    raise exception 'INVALID_DATE';
  end if;

  -- Cuenta: por nombre; sin nombre solo vale si el usuario tiene una única cuenta activa.
  if nullif(trim(coalesce(p_account, '')), '') is null then
    select count(*) into v_count from public.accounts
     where user_id = v_user and deleted_at is null and not is_archived;
    if v_count <> 1 then
      raise exception 'ACCOUNT_REQUIRED';
    end if;
    select * into v_account from public.accounts
     where user_id = v_user and deleted_at is null and not is_archived;
  else
    select count(*) into v_count from public.accounts
     where user_id = v_user and deleted_at is null and not is_archived
       and lower(name) = lower(trim(p_account));
    if v_count = 0 then raise exception 'ACCOUNT_NOT_FOUND'; end if;
    if v_count > 1 then raise exception 'ACCOUNT_AMBIGUOUS'; end if;
    select * into v_account from public.accounts
     where user_id = v_user and deleted_at is null and not is_archived
       and lower(name) = lower(trim(p_account));
  end if;

  -- Categoría del mismo tipo que el movimiento (las reglas de la tabla exigen una).
  if nullif(trim(coalesce(p_category, '')), '') is null then
    raise exception 'CATEGORY_REQUIRED';
  end if;
  select * into v_category from public.categories
   where user_id = v_user and deleted_at is null
     and type = v_type::text::public.category_type
     and lower(name) = lower(trim(p_category))
   order by created_at
   limit 1;
  if v_category.id is null then
    raise exception 'CATEGORY_NOT_FOUND';
  end if;

  -- Idempotencia: la misma clave devuelve el movimiento ya creado.
  if p_key is not null then
    select transaction_id into v_existing from public.shortcut_events
     where user_id = v_user and idempotency_key = p_key;
    if v_existing is not null then
      return jsonb_build_object('id', v_existing, 'duplicado', true, 'cuenta', v_account.name, 'categoria', v_category.name,
                                'moneda', v_account.currency_code, 'monto', p_amount, 'tipo', v_type, 'fecha', v_date);
    end if;
  end if;

  begin
    insert into public.transactions
      (user_id, account_id, category_id, type, direction, amount, currency_code, description, transaction_date, notes)
    values
      (v_user, v_account.id, v_category.id, v_type,
       case when v_type = 'EXPENSE' then 'OUTFLOW' else 'INFLOW' end::public.transaction_direction,
       p_amount, v_account.currency_code, v_description, v_date, 'Registrado desde Atajos del iPhone')
    returning id into v_tx;

    if p_key is not null then
      insert into public.shortcut_events (user_id, idempotency_key, transaction_id) values (v_user, p_key, v_tx);
    end if;
  exception when unique_violation then
    -- Dos peticiones simultáneas con la misma clave: gana la primera, esta se deshace.
    select transaction_id into v_existing from public.shortcut_events
     where user_id = v_user and idempotency_key = p_key;
    return jsonb_build_object('id', v_existing, 'duplicado', true, 'cuenta', v_account.name, 'categoria', v_category.name,
                              'moneda', v_account.currency_code, 'monto', p_amount, 'tipo', v_type, 'fecha', v_date);
  end;

  return jsonb_build_object('id', v_tx, 'duplicado', false, 'cuenta', v_account.name, 'categoria', v_category.name,
                            'moneda', v_account.currency_code, 'monto', p_amount, 'tipo', v_type, 'fecha', v_date);
end;
$$;

revoke all on function public.shortcut_options(text) from public;
revoke all on function public.shortcut_register_movement(text, text, numeric, text, text, text, date, text) from public;
-- Las llama el servidor con la clave pública: la autorización es el token.
grant execute on function public.shortcut_options(text) to anon, authenticated;
grant execute on function public.shortcut_register_movement(text, text, numeric, text, text, text, date, text) to anon, authenticated;
