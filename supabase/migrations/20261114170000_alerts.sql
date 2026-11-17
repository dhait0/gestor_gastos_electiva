-- L01: alertas internas
--
-- Cambio aditivo. Las alertas son registros dentro de la app: no se envía
-- ningún aviso externo (email, push, SMS) y `metadata` no debe guardar secretos
-- ni datos financieros sensibles innecesarios.
--
-- Deduplicación: (user_id, dedup_key) es único. Se usa un índice único NO
-- parcial (los NULL siguen siendo distintos entre sí) para que PostgREST pueda
-- inferirlo en `upsert ... ignoreDuplicates`; equivale al índice parcial
-- `where dedup_key is not null` del modelo §31.
--
-- Rollback: drop table public.alerts.

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (length(trim(type)) > 0),
  title text not null check (length(trim(title)) > 0),
  message text not null check (length(trim(message)) > 0),
  severity alert_severity not null default 'INFO',
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  dedup_key text check (dedup_key is null or length(trim(dedup_key)) > 0),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint alerts_read_consistency
    check ((is_read and read_at is not null) or (not is_read and read_at is null)),
  constraint alerts_dedup_unique unique (user_id, dedup_key)
);

create index alerts_user_created_idx on public.alerts (user_id, created_at desc);
create index alerts_user_unread_idx on public.alerts (user_id, is_read, created_at desc);

alter table public.alerts enable row level security;

create policy "alerts_select_own"
  on public.alerts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "alerts_update_own"
  on public.alerts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
