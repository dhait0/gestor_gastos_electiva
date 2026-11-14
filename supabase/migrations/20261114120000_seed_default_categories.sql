-- Bloque 0: categorías por defecto para usuarios nuevos
--
-- Hasta ahora el onboarding no creaba categorías, así que un usuario nuevo no
-- podía registrar su primer ingreso o gasto (categoría obligatoria en
-- transactions_income_rules y en el formulario) sin pasar antes por /categorias.
-- Esto también dejaba sin datos de partida al flujo E2E.
--
-- Cambio aditivo: se extiende private.handle_new_user() para sembrar un
-- conjunto mínimo de categorías marcadas is_default = true. Solo aplica a
-- usuarios creados después de esta migración; no se hace backfill sobre
-- usuarios existentes. Las categorías son editables y archivables como
-- cualquier otra (soft delete).
--
-- Rollback: restaurar la versión previa de la función (solo insert en profiles).
-- Las categorías ya sembradas se pueden archivar con deleted_at.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, currency_code, timezone, safety_reserve, locale)
  values (new.id, 'COP', 'America/Bogota', 0, 'es-CO');

  insert into public.categories (user_id, name, type, color, is_default)
  values
    (new.id, 'Salario',         'INCOME',  '#20BDA5', true),
    (new.id, 'Otros ingresos',  'INCOME',  '#315CF5', true),
    (new.id, 'Alimentación',    'EXPENSE', '#FFC777', true),
    (new.id, 'Transporte',      'EXPENSE', '#315CF5', true),
    (new.id, 'Vivienda',        'EXPENSE', '#20BDA5', true),
    (new.id, 'Servicios',       'EXPENSE', '#315CF5', true),
    (new.id, 'Salud',           'EXPENSE', '#20BDA5', true),
    (new.id, 'Ocio',            'EXPENSE', '#FFC777', true),
    (new.id, 'Otros gastos',    'EXPENSE', '#162039', true);

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon;
