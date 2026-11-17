-- M02: roles, permisos y administración (RBAC) con auditoría
--
-- Cambio aditivo; no toca las entidades financieras ni sus políticas RLS.
-- PRINCIPIO RECTOR: ningún rol (incluido admin) obtiene acceso a las tablas
-- financieras de otros usuarios. Las políticas RLS de esas tablas siguen siendo
-- `auth.uid() = user_id` y NO se añade ninguna política por rol. La
-- administración opera solo a través de las funciones de abajo, que exponen
-- datos de cuenta mínimos (nombre, email, rol, fecha de alta) y conteos
-- agregados SIN importes.
--
-- Modelo:
--   * roles/permissions/role_permissions: datos de referencia sembrados aquí.
--   * user_roles: UN rol elevado por usuario (unique user_id). Sin fila = `user`.
--   * admin_audit_logs: solo anexar; sin políticas para el cliente.
--   * Denegación por defecto: roles, permissions, role_permissions y
--     admin_audit_logs no tienen políticas, por lo que el cliente no los lee.
--
-- Alta del primer admin (sin UI, a propósito): un operador con acceso al
-- proyecto ejecuta `select private.bootstrap_first_admin('<uuid del usuario>')`
-- desde el SQL editor / rol service. Solo funciona mientras NO exista ningún
-- admin; después los cambios de rol exigen un admin y quedan auditados. No se
-- infiere admin por email.
--
-- Rollback: drop function public.admin_*; drop function public.current_user_*;
-- drop function private.has_permission; drop function private.bootstrap_first_admin;
-- drop table public.admin_audit_logs, public.user_roles, public.role_permissions,
-- public.permissions, public.roles.

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('user', 'support', 'admin')),
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (length(trim(action)) > 0),
  target_user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Un usuario solo puede ver SU propia asignación de rol (para pintar la UI);
-- la autorización real nunca depende de lo que la UI muestre.
create policy "user_roles_select_own"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);

-- Sin políticas de INSERT/UPDATE/DELETE en ninguna tabla de RBAC para el
-- cliente: solo las funciones definer de abajo escriben.

-- Datos de referencia
insert into public.roles (key, name, description) values
  ('user', 'Usuario', 'Solo sus propios datos financieros.'),
  ('support', 'Soporte', 'Consulta mínima de cuentas de usuario; sin acceso a datos financieros.'),
  ('admin', 'Administrador', 'Gestión de roles, métricas agregadas y auditoría; sin acceso a datos financieros ajenos.');

insert into public.permissions (key, description) values
  ('admin.access', 'Entrar a la consola de administración'),
  ('users.read', 'Ver datos mínimos de cuenta de los usuarios (nombre, email, rol, alta)'),
  ('users.roles.manage', 'Asignar y revocar roles'),
  ('metrics.read', 'Ver métricas agregadas sin importes'),
  ('audit.read', 'Ver la auditoría de administración');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on (
  (r.key = 'support' and p.key in ('admin.access', 'users.read'))
  or (r.key = 'admin' and p.key in ('admin.access', 'users.read', 'users.roles.manage', 'metrics.read', 'audit.read'))
);

-- ¿Tiene este usuario el permiso? (sin fila en user_roles => rol `user` => ninguno)
create or replace function private.has_permission(p_user uuid, p_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user and p.key = p_key
  );
$$;

revoke all on function private.has_permission(uuid, text) from public, anon, authenticated;

-- Permisos y rol del usuario autenticado (para el servidor; nunca del cliente)
create or replace function public.current_user_permissions()
returns table (permission_key text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.key
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = (select auth.uid());
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select r.key from public.user_roles ur join public.roles r on r.id = ur.role_id where ur.user_id = (select auth.uid())),
    'user'
  );
$$;

-- Listado mínimo de usuarios (sin ningún dato financiero)
create or replace function public.admin_list_users(p_limit integer default 50, p_offset integer default 0)
returns table (
  id uuid,
  display_name text,
  email text,
  created_at timestamptz,
  role_key text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.has_permission((select auth.uid()), 'users.read') then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;

  return query
  select p.id, p.display_name, u.email::text, p.created_at, coalesce(r.key, 'user')
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.user_roles ur on ur.user_id = p.id
  left join public.roles r on r.id = ur.role_id
  order by p.created_at desc
  limit greatest(1, least(p_limit, 200))
  offset greatest(0, p_offset);
end;
$$;

-- Cambia el rol de un usuario y lo audita en la misma transacción
create or replace function public.admin_set_user_role(p_target uuid, p_role_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_old text;
  v_role_id uuid;
begin
  if v_actor is null or not private.has_permission(v_actor, 'users.roles.manage') then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  if p_role_key not in ('user', 'support', 'admin') then
    raise exception 'Rol inválido' using errcode = '23514';
  end if;
  if p_target = v_actor then
    raise exception 'No puedes cambiar tu propio rol' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  v_old := coalesce(
    (select r.key from public.user_roles ur join public.roles r on r.id = ur.role_id where ur.user_id = p_target),
    'user'
  );

  if v_old = p_role_key then
    return;
  end if;

  -- Nunca puede quedarse la plataforma sin administradores
  if v_old = 'admin' and (select count(*) from public.user_roles ur join public.roles r on r.id = ur.role_id where r.key = 'admin') <= 1 then
    raise exception 'No se puede quitar el último administrador' using errcode = '23514';
  end if;

  if p_role_key = 'user' then
    delete from public.user_roles where user_id = p_target;
  else
    select id into v_role_id from public.roles where key = p_role_key;
    insert into public.user_roles (user_id, role_id, granted_by)
    values (p_target, v_role_id, v_actor)
    on conflict (user_id) do update set role_id = excluded.role_id, granted_by = excluded.granted_by, granted_at = now();
  end if;

  insert into public.admin_audit_logs (actor_id, action, target_user_id, metadata)
  values (v_actor, 'role.changed', p_target, jsonb_build_object('from', v_old, 'to', p_role_key));
end;
$$;

-- Métricas agregadas: solo conteos, jamás importes ni datos por usuario
create or replace function public.admin_aggregate_metrics()
returns table (metric text, value bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.has_permission((select auth.uid()), 'metrics.read') then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;

  return query
  select 'users_total'::text, count(*)::bigint from public.profiles
  union all
  select 'users_last_30_days', count(*)::bigint from public.profiles where created_at >= now() - interval '30 days'
  union all
  select 'users_support', count(*)::bigint from public.user_roles ur join public.roles r on r.id = ur.role_id where r.key = 'support'
  union all
  select 'users_admin', count(*)::bigint from public.user_roles ur join public.roles r on r.id = ur.role_id where r.key = 'admin'
  union all
  select 'accounts_total', count(*)::bigint from public.accounts where deleted_at is null
  union all
  select 'transactions_total', count(*)::bigint from public.transactions where deleted_at is null;
end;
$$;

create or replace function public.admin_list_audit_logs(p_limit integer default 50)
returns table (
  id uuid,
  actor_id uuid,
  actor_email text,
  action text,
  target_user_id uuid,
  target_email text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not private.has_permission((select auth.uid()), 'audit.read') then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;

  return query
  select l.id, l.actor_id, a.email::text, l.action, l.target_user_id, t.email::text, l.metadata, l.created_at
  from public.admin_audit_logs l
  left join auth.users a on a.id = l.actor_id
  left join auth.users t on t.id = l.target_user_id
  order by l.created_at desc
  limit greatest(1, least(p_limit, 200));
end;
$$;

-- Primer admin: solo mientras no exista ninguno; queda auditado. Sin acceso desde la API.
create or replace function private.bootstrap_first_admin(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role_id uuid;
begin
  if exists (select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id where r.key = 'admin') then
    raise exception 'Ya existe un administrador' using errcode = '23514';
  end if;
  if not exists (select 1 from public.profiles where id = p_user) then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;

  select id into v_role_id from public.roles where key = 'admin';
  insert into public.user_roles (user_id, role_id, granted_by) values (p_user, v_role_id, null)
  on conflict (user_id) do update set role_id = excluded.role_id, granted_at = now();

  insert into public.admin_audit_logs (actor_id, action, target_user_id, metadata)
  values (null, 'role.bootstrap', p_user, jsonb_build_object('to', 'admin'));
end;
$$;

revoke all on function private.bootstrap_first_admin(uuid) from public, anon, authenticated;

-- Funciones públicas: solo usuarios autenticados (cada una comprueba su permiso)
revoke execute on function public.current_user_permissions() from public, anon;
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.admin_list_users(integer, integer) from public, anon;
revoke execute on function public.admin_set_user_role(uuid, text) from public, anon;
revoke execute on function public.admin_aggregate_metrics() from public, anon;
revoke execute on function public.admin_list_audit_logs(integer) from public, anon;
grant execute on function public.current_user_permissions() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.admin_list_users(integer, integer) to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_aggregate_metrics() to authenticated;
grant execute on function public.admin_list_audit_logs(integer) to authenticated;
