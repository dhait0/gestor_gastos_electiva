-- Agrega políticas DELETE que faltaban en todas las tablas con user_id.
-- Sin estas políticas, RLS bloquea silenciosamente cualquier DELETE.

-- accounts
create policy "users can delete own accounts"
  on public.accounts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- categories
create policy "users can delete own categories"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- transactions
create policy "users can delete own transactions"
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- obligations
create policy "users can delete own obligations"
  on public.obligations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- budgets
create policy "users can delete own budgets"
  on public.budgets for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- goals
create policy "users can delete own goals"
  on public.goals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- goal_contributions
create policy "users can delete own goal_contributions"
  on public.goal_contributions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- recurring_transactions
create policy "users can delete own recurring_transactions"
  on public.recurring_transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- subscriptions
create policy "users can delete own subscriptions"
  on public.subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- debts
create policy "users can delete own debts"
  on public.debts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- debt_payments
create policy "users can delete own debt_payments"
  on public.debt_payments for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- alerts
create policy "users can delete own alerts"
  on public.alerts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- shortcut_tokens
create policy "users can delete own shortcut_tokens"
  on public.shortcut_tokens for delete
  to authenticated
  using ((select auth.uid()) = user_id);
