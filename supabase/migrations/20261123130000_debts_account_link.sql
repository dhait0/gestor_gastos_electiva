-- Vincula cada deuda a una cuenta bancaria/tarjeta del usuario.
-- Nulo = deuda sin cuenta asociada (préstamos, créditos externos).
-- ON DELETE SET NULL: si la cuenta se elimina, la deuda no desaparece.

alter table public.debts
  add column if not exists account_id uuid
    references public.accounts(id) on delete set null;

-- Índice para buscar deudas por cuenta (ej: "todas las deudas de esta tarjeta")
create index if not exists debts_account_id_idx
  on public.debts(account_id)
  where account_id is not null;

comment on column public.debts.account_id is
  'Cuenta asociada a esta deuda (ej: tarjeta de crédito). Nulo si es un crédito externo.';
