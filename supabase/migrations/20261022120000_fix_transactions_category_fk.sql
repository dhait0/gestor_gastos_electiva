-- C01: corregir ON DELETE de transactions_category_fk
--
-- La restricción original se definió como:
--   foreign key (category_id, user_id) references public.categories (id, user_id)
--   on delete set null
--
-- Como la FK es compuesta sobre (category_id, user_id) y user_id es NOT NULL,
-- un DELETE sobre categories intenta anular user_id, lo que viola NOT NULL
-- (error 23502). El borrado lógico (soft delete) de categorías es el patrón
-- de la app, por lo que el DELETE físico no debe propagar SET NULL.
--
-- Cambio aditivo: reemplazar on delete set null por on delete restrict, de modo
-- que el borrado físico de una categoría con transacciones asociadas se bloquee
-- en la base de datos (defensa en profundidad; la UI usa soft delete).

alter table public.transactions
  drop constraint if exists transactions_category_fk;

alter table public.transactions
  add constraint transactions_category_fk
  foreign key (category_id, user_id)
  references public.categories (id, user_id)
  on delete restrict;
