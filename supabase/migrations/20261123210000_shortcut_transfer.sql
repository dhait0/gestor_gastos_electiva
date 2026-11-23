-- Atajos del iPhone: soporte para transferencias entre cuentas propias.
-- Crea dos transacciones atómicas: EXPENSE/OUTFLOW en origen e INCOME/INFLOW en destino.
-- Reutiliza o crea automáticamente las categorías "Transferencia interna" (EXPENSE) e
-- "Ingresos/transferencias" (INCOME) del usuario. Aditiva: no modifica tablas existentes.
-- Rollback: drop function public.shortcut_register_transfer;

create or replace function public.shortcut_register_transfer(
  p_token_hash text,
  p_amount     numeric,
  p_description text    default null,
  p_account_origin text default null,
  p_account_dest   text default null,
  p_date date         default null,
  p_key  text         default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user           uuid := private.shortcut_user(p_token_hash);
  v_origin         public.accounts%rowtype;
  v_dest           public.accounts%rowtype;
  v_cat_expense    uuid;
  v_cat_income     uuid;
  v_description    text;
  v_tz             text;
  v_today          date;
  v_date           date;
  v_tx_out         uuid;
  v_tx_in          uuid;
  v_existing_out   uuid;
  v_count          integer;
begin
  -- Validar monto
  if p_amount is null or p_amount <= 0 or p_amount > 1000000000000 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Descripción por defecto
  v_description := nullif(trim(coalesce(p_description, '')), '');
  if v_description is null then v_description := 'Transferencia'; end if;
  if length(v_description) > 200 then raise exception 'INVALID_DESCRIPTION'; end if;

  -- Fecha
  select coalesce(timezone, 'America/Bogota') into v_tz from public.profiles where id = v_user;
  v_today := (now() at time zone coalesce(v_tz, 'America/Bogota'))::date;
  v_date  := coalesce(p_date, v_today);
  if v_date > v_today + 1 or v_date < v_today - 3650 then raise exception 'INVALID_DATE'; end if;

  -- Cuenta origen
  if nullif(trim(coalesce(p_account_origin, '')), '') is null then
    raise exception 'TRANSFER_ORIGIN_REQUIRED';
  end if;
  select count(*) into v_count from public.accounts
   where user_id = v_user and deleted_at is null and not is_archived
     and lower(name) = lower(trim(p_account_origin));
  if v_count = 0 then raise exception 'TRANSFER_ORIGIN_NOT_FOUND'; end if;
  if v_count > 1 then raise exception 'ACCOUNT_AMBIGUOUS'; end if;
  select * into v_origin from public.accounts
   where user_id = v_user and deleted_at is null and not is_archived
     and lower(name) = lower(trim(p_account_origin));

  -- Cuenta destino
  if nullif(trim(coalesce(p_account_dest, '')), '') is null then
    raise exception 'TRANSFER_DEST_REQUIRED';
  end if;
  if lower(trim(p_account_dest)) = lower(trim(p_account_origin)) then
    raise exception 'TRANSFER_SAME_ACCOUNT';
  end if;
  select count(*) into v_count from public.accounts
   where user_id = v_user and deleted_at is null and not is_archived
     and lower(name) = lower(trim(p_account_dest));
  if v_count = 0 then raise exception 'TRANSFER_DEST_NOT_FOUND'; end if;
  select * into v_dest from public.accounts
   where user_id = v_user and deleted_at is null and not is_archived
     and lower(name) = lower(trim(p_account_dest));

  -- Categoría EXPENSE para el origen ("Transferencia interna"); crear si no existe
  select id into v_cat_expense from public.categories
   where user_id = v_user and deleted_at is null and type = 'EXPENSE'
     and lower(name) in ('transferencia interna', 'transferencias internas', 'transferencia')
   order by created_at limit 1;
  if v_cat_expense is null then
    insert into public.categories (user_id, name, type, color, icon)
    values (v_user, 'Transferencia interna', 'EXPENSE', '#6B7280', 'arrow-right-left')
    returning id into v_cat_expense;
  end if;

  -- Categoría INCOME para el destino ("Ingresos/transferencias"); crear si no existe
  select id into v_cat_income from public.categories
   where user_id = v_user and deleted_at is null and type = 'INCOME'
     and lower(name) in ('ingresos/transferencias', 'transferencias', 'transferencia interna', 'transferencia')
   order by created_at limit 1;
  if v_cat_income is null then
    insert into public.categories (user_id, name, type, color, icon)
    values (v_user, 'Ingresos/transferencias', 'INCOME', '#6B7280', 'arrow-right-left')
    returning id into v_cat_income;
  end if;

  -- Idempotencia
  if p_key is not null then
    select transaction_id into v_existing_out from public.shortcut_events
     where user_id = v_user and idempotency_key = p_key;
    if v_existing_out is not null then
      return jsonb_build_object(
        'ok', true, 'duplicado', true,
        'mensaje', 'Ya estaba registrada: transferencia de ' || v_origin.name || ' a ' || v_dest.name
      );
    end if;
  end if;

  -- Insertar los dos lados en una transacción
  begin
    insert into public.transactions
      (user_id, account_id, category_id, type, direction, amount, currency_code, description, transaction_date, notes)
    values
      (v_user, v_origin.id, v_cat_expense, 'EXPENSE', 'OUTFLOW',
       p_amount, v_origin.currency_code, v_description, v_date,
       'Transferencia a ' || v_dest.name || ' — Registrado desde Atajos del iPhone')
    returning id into v_tx_out;

    insert into public.transactions
      (user_id, account_id, category_id, type, direction, amount, currency_code, description, transaction_date, notes)
    values
      (v_user, v_dest.id, v_cat_income, 'INCOME', 'INFLOW',
       p_amount, v_dest.currency_code, v_description, v_date,
       'Transferencia desde ' || v_origin.name || ' — Registrado desde Atajos del iPhone')
    returning id into v_tx_in;

    if p_key is not null then
      insert into public.shortcut_events (user_id, idempotency_key, transaction_id)
      values (v_user, p_key, v_tx_out);
    end if;
  exception when unique_violation then
    return jsonb_build_object(
      'ok', true, 'duplicado', true,
      'mensaje', 'Ya estaba registrada: transferencia de ' || v_origin.name || ' a ' || v_dest.name
    );
  end;

  return jsonb_build_object(
    'ok', true, 'duplicado', false,
    'origen', v_origin.name,
    'destino', v_dest.name,
    'monto', p_amount,
    'mensaje', 'Transferencia de $' || to_char(p_amount, 'FM999,999,999,999') || ' de ' || v_origin.name || ' a ' || v_dest.name || ' registrada'
  );
end;
$$;

revoke all on function public.shortcut_register_transfer(text, numeric, text, text, text, date, text) from public;
grant execute on function public.shortcut_register_transfer(text, numeric, text, text, text, date, text) to anon, authenticated;
