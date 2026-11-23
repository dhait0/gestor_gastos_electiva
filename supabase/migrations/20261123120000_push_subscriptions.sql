-- Tabla para almacenar suscripciones de notificaciones push web (Web Push API).
-- Cada usuario puede tener múltiples suscripciones (un dispositivo / navegador por fila).
-- Los endpoint son únicos por dispositivo; se usan para enviar notificaciones desde el backend.

create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  endpoint      text not null,
  p256dh        text not null,
  auth_key      text not null,
  user_agent    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint push_subscriptions_endpoint_key unique (endpoint)
);

-- RLS
alter table public.push_subscriptions enable row level security;

-- El usuario solo ve y gestiona sus propias suscripciones
create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- Las Edge Functions usan service_role y no están limitadas por RLS.

-- updated_at automático
create trigger push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function private.set_updated_at();

-- Índice para buscar por usuario al enviar notificaciones
create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions(user_id);
