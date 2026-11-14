import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestUser {
  id: string;
  accessToken: string;
  client: SupabaseClient;
  email: string;
}

let userA: TestUser;
let userB: TestUser;
let clientA: SupabaseClient;
let clientB: SupabaseClient;

async function createTestUser(suffix: string) {
  const email = `test-${suffix}-${Date.now()}@example.com`;
  const password = 'TestPass123!';
  
  // Use service role to create user (bypasses email confirmation)
  const { error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw createError;
  
  // Sign in to get access token
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) {
    throw new Error('No session returned from signIn');
  }
  
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
  });
  
  return { id: data.user.id, accessToken: data.session.access_token, client, email };
}

async function cleanupTestUsers() {
  const { data: users } = await service.auth.admin.listUsers();
  for (const user of users.users) {
    if (user.email?.includes('@example.com')) {
      await service.auth.admin.deleteUser(user.id);
    }
  }
}

describe('RLS - P0 Tables', () => {
  beforeAll(async () => {
    await cleanupTestUsers();
    userA = await createTestUser('a');
    userB = await createTestUser('b');
    clientA = userA.client;
    clientB = userB.client;
  });

  describe('profiles', () => {
    beforeEach(async () => {
      await service.from('profiles').delete()
        .neq('id', userA.id)
        .neq('id', userB.id)
        .neq('id', '00000000-0000-0000-0000-000000000000');
    });
    it('A can read own profile', async () => {
      const { data, error } = await clientA.from('profiles').select('*').single();
      expect(error).toBeNull();
      expect(data?.id).toBe(userA.id);
    });

    it('B cannot read A profile', async () => {
      const { data, error } = await clientB.from('profiles').select('*').eq('id', userA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('anon cannot read profiles', async () => {
      const { data, error } = await anon.from('profiles').select('*').eq('id', userA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('A can update own profile', async () => {
      const { data, error } = await clientA
        .from('profiles')
        .update({ display_name: 'Test User A' })
        .eq('id', userA.id)
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.display_name).toBe('Test User A');
    });

    it('B cannot update A profile', async () => {
      const { data, error } = await clientB
        .from('profiles')
        .update({ display_name: 'Hacked' })
        .eq('id', userA.id)
        .select();
      // RLS using clause filters out the row, so update affects 0 rows
      // Returns empty data array, no error
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('accounts', () => {
    let accountA: { id: string };

    beforeEach(async () => {
      await service.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await service.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { data, error } = await clientA
        .from('accounts')
        .insert({ name: 'Cuenta A', type: 'CHECKING', opening_balance: 1000, user_id: userA.id })
        .select()
        .single();
      console.log('DEBUG beforeEach accounts: data=', data, 'error=', error);
      accountA = data!;
    });

    it('A can read own account', async () => {
      const { data, error } = await clientA.from('accounts').select('*').eq('id', accountA.id).single();
      expect(error).toBeNull();
      expect(data?.id).toBe(accountA.id);
    });

    it('B cannot read A account', async () => {
      const { data, error } = await clientB.from('accounts').select('*').eq('id', accountA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('anon cannot read accounts', async () => {
      const { data, error } = await anon.from('accounts').select('*').eq('id', accountA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('A can insert account for self', async () => {
      const { data, error } = await clientA
        .from('accounts')
        .insert({ name: 'Cuenta A2', type: 'SAVINGS', opening_balance: 500, user_id: userA.id })
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.user_id).toBe(userA.id);
    });

    it('A cannot insert account for B', async () => {
      const { error } = await clientA
        .from('accounts')
        .insert({ name: 'Hacked', type: 'CASH', opening_balance: 0, user_id: userB.id });
      expect(error).not.toBeNull();
    });

    it('A can update own account', async () => {
      const { data, error } = await clientA
        .from('accounts')
        .update({ name: 'Cuenta A Updated' })
        .eq('id', accountA.id)
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.name).toBe('Cuenta A Updated');
    });

    it('B cannot update A account', async () => {
      const { data, error } = await clientB
        .from('accounts')
        .update({ name: 'Hacked' })
        .eq('id', accountA.id)
        .select();
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('categories', () => {
    let categoryA: { id: string };

    beforeEach(async () => {
      await service.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await service.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const uniqueName = `Alimentación ${Date.now()}`;
      const { data, error } = await clientA
        .from('categories')
        .insert({ name: uniqueName, type: 'EXPENSE', user_id: userA.id })
        .select()
        .single();
      console.log('DEBUG beforeEach categories: data=', data, 'error=', error);
      categoryA = data!;
    });

    it('A can read own category', async () => {
      const { data, error } = await clientA.from('categories').select('*').eq('id', categoryA.id).single();
      expect(error).toBeNull();
      expect(data?.id).toBe(categoryA.id);
    });

    it('B cannot read A category', async () => {
      const { data, error } = await clientB.from('categories').select('*').eq('id', categoryA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('anon cannot read categories', async () => {
      const { data, error } = await anon.from('categories').select('*').eq('id', categoryA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('A can insert category for self', async () => {
      const { data, error } = await clientA
        .from('categories')
        .insert({ name: 'Transporte', type: 'EXPENSE', user_id: userA.id })
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.user_id).toBe(userA.id);
    });

    it('A cannot insert category for B', async () => {
      const { error } = await clientA
        .from('categories')
        .insert({ name: 'Hacked', type: 'INCOME', user_id: userB.id });
      expect(error).not.toBeNull();
    });

    it('A can update own category', async () => {
      const { data, error } = await clientA
        .from('categories')
        .update({ name: 'Comida' })
        .eq('id', categoryA.id)
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.name).toBe('Comida');
    });

    it('B cannot update A category', async () => {
      const { data, error } = await clientB
        .from('categories')
        .update({ name: 'Hacked' })
        .eq('id', categoryA.id)
        .select();
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('transactions', () => {
    let accountA: { id: string };
    let categoryExpenseA: { id: string };

    beforeEach(async () => {
      await service.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const timestamp = Date.now();
      const [{ data: acc }, { data: catExp }] = await Promise.all([
        clientA.from('accounts').insert({ name: `Cuenta A ${timestamp}`, type: 'CHECKING', opening_balance: 1000, user_id: userA.id }).select().single(),
        clientA.from('categories').insert({ name: `Alimentación ${timestamp}`, type: 'EXPENSE', user_id: userA.id }).select().single(),
      ]);
      accountA = acc!;
      categoryExpenseA = catExp!;
    });

    it('A can read own transaction', async () => {
      const { data: tx } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 500,
          description: 'Supermercado',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();

      const { data, error } = await clientA.from('transactions').select('*').eq('id', tx!.id).single();
      expect(error).toBeNull();
      expect(data?.id).toBe(tx!.id);
    });

    it('B cannot read A transaction', async () => {
      const { data: tx } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 500,
          description: 'Supermercado',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();

      const { data, error } = await clientB.from('transactions').select('*').eq('id', tx!.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('anon cannot read transactions', async () => {
      const { data: tx } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 500,
          description: 'Supermercado',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();

      const { data, error } = await anon.from('transactions').select('*').eq('id', tx!.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('A can insert transaction for self', async () => {
      const { data, error } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 250,
          description: 'Transporte',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.user_id).toBe(userA.id);
    });

    it('A cannot insert transaction for B account', async () => {
      const { data: accountB } = await clientB
        .from('accounts')
        .insert({ name: 'Cuenta B', type: 'CASH', opening_balance: 0, user_id: userB.id })
        .select()
        .single();

      const { error } = await clientA
        .from('transactions')
        .insert({
          account_id: accountB!.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 100,
          description: 'Hacked',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        });
      expect(error).not.toBeNull();
    });

    it('A can update own transaction', async () => {
      const { data: tx } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 100,
          description: 'Original',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();

      const { data, error } = await clientA
        .from('transactions')
        .update({ description: 'Actualizado' })
        .eq('id', tx!.id)
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.description).toBe('Actualizado');
    });

    it('B cannot update A transaction', async () => {
      const { data: tx } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA.id,
          category_id: categoryExpenseA.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 100,
          description: 'Original',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();

      const { data, error } = await clientB
        .from('transactions')
        .update({ description: 'Hacked' })
        .eq('id', tx!.id)
        .select();
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('obligations', () => {
    let obligationA: { id: string };

    beforeEach(async () => {
      await service.from('obligations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const timestamp = Date.now();
      const { data } = await clientA
        .from('obligations')
        .insert({
          name: `Arriendo ${timestamp}`,
          amount: 800000,
          due_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();
      obligationA = data!;
    });

    it('A can read own obligation', async () => {
      const { data, error } = await clientA.from('obligations').select('*').eq('id', obligationA.id).single();
      expect(error).toBeNull();
      expect(data?.id).toBe(obligationA.id);
    });

    it('B cannot read A obligation', async () => {
      const { data, error } = await clientB.from('obligations').select('*').eq('id', obligationA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('anon cannot read obligations', async () => {
      const { data, error } = await anon.from('obligations').select('*').eq('id', obligationA.id).single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });

    it('A can insert obligation for self', async () => {
      const { data, error } = await clientA
        .from('obligations')
        .insert({
          name: 'Servicios',
          amount: 200000,
          due_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          user_id: userA.id,
        })
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.user_id).toBe(userA.id);
    });

    it('A cannot insert obligation for B', async () => {
      const { error } = await clientA
        .from('obligations')
        .insert({
          name: 'Hacked',
          amount: 100000,
          due_date: new Date().toISOString().split('T')[0],
          user_id: userB.id,
        });
      expect(error).not.toBeNull();
    });

    it('A can update own obligation', async () => {
      const { data, error } = await clientA
        .from('obligations')
        .update({ name: 'Arriendo Actualizado' })
        .eq('id', obligationA.id)
        .select()
        .single();
      expect(error).toBeNull();
      expect(data?.name).toBe('Arriendo Actualizado');
    });

    it('B cannot update A obligation', async () => {
      const { data, error } = await clientB
        .from('obligations')
        .update({ name: 'Hacked' })
        .eq('id', obligationA.id)
        .select();
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Auth trigger', () => {
    it('creates profile on signup', async () => {
      const email = `trigger-test-${Date.now()}@example.com`;
      const password = 'TestPass123!';
      
      const { data: signUpData, error: signUpError } = await anon.auth.signUp({ email, password });
      expect(signUpError).toBeNull();
      expect(signUpData.user).not.toBeNull();

      const { data: profile, error: profileError } = await service
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user!.id)
        .single();
      
      expect(profileError).toBeNull();
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe(signUpData.user!.id);
      expect(profile?.currency_code).toBe('COP');
      expect(profile?.timezone).toBe('America/Bogota');
      expect(profile?.safety_reserve).toBe(0);

      // Cleanup
      await service.auth.admin.deleteUser(signUpData.user!.id);
    });
  });

  describe('Cross-ownership integrity', () => {
    beforeEach(async () => {
      await service.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await service.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await service.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    });
it('composite FK prevents A transaction on B account', async () => {
      const { data: accountB } = await clientB
        .from('accounts')
        .insert({ name: 'Cuenta B', type: 'CHECKING', opening_balance: 0, user_id: userB.id })
        .select()
        .single();

      const { data: catA } = await clientA
        .from('categories')
        .insert({ name: 'Test', type: 'EXPENSE', user_id: userA.id })
        .select()
        .single();

      const { error } = await clientA
        .from('transactions')
        .insert({
          account_id: accountB!.id,
          category_id: catA!.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 100,
          description: 'Cross ownership test',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        });
      
      // Composite FK blocks: (account_id, user_id) must reference accounts(id, user_id)
      expect(error).not.toBeNull();
      expect(error?.message).toContain('transactions_account_fk');
    });

    it('composite FK prevents A transaction on B category', async () => {
      const { data: accountA } = await clientA
        .from('accounts')
        .insert({ name: 'Cuenta A', type: 'CHECKING', opening_balance: 1000, user_id: userA.id })
        .select()
        .single();

      const { data: catB } = await clientB
        .from('categories')
        .insert({ name: 'Test B', type: 'EXPENSE', user_id: userB.id })
        .select()
        .single();

      const { error } = await clientA
        .from('transactions')
        .insert({
          account_id: accountA!.id,
          category_id: catB!.id,
          type: 'EXPENSE',
          direction: 'OUTFLOW',
          amount: 100,
          description: 'Cross ownership test',
          transaction_date: new Date().toISOString().split('T')[0],
          user_id: userA.id,
        });
      
      // Account owned by A (RLS allows), but category owned by B (FK blocks)
      expect(error).not.toBeNull();
      expect(error?.message).toContain('transactions_category_fk');
    });
  });
});

describe('default categories on signup', () => {
  it('a new user gets default INCOME and EXPENSE categories, owned by that user', async () => {
    const fresh = await createTestUser('defaults');

    const { data, error } = await service
      .from('categories')
      .select('user_id, type, is_default')
      .eq('user_id', fresh.id);

    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((c) => c.user_id === fresh.id && c.is_default)).toBe(true);
    expect(data!.some((c) => c.type === 'INCOME')).toBe(true);
    expect(data!.some((c) => c.type === 'EXPENSE')).toBe(true);
  });

  it('seeded categories are isolated: B cannot read the defaults of A', async () => {
    const fresh = await createTestUser('defaults-iso');

    const { data, error } = await clientB
      .from('categories')
      .select('id')
      .eq('user_id', fresh.id);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});


describe('budgets, goals and goal_contributions', () => {
  const stamp = Date.now();
  let expenseCatA: string;
  let incomeCatA: string;
  let budgetA: string;
  let goalA: string;

  beforeAll(async () => {
    const { data: exp } = await service
      .from('categories')
      .insert({ user_id: userA.id, name: `Presupuesto ${stamp}`, type: 'EXPENSE' })
      .select('id')
      .single();
    const { data: inc } = await service
      .from('categories')
      .insert({ user_id: userA.id, name: `Ingreso ${stamp}`, type: 'INCOME' })
      .select('id')
      .single();
    expenseCatA = exp!.id;
    incomeCatA = inc!.id;

    const { data: budget, error: budgetError } = await clientA
      .from('budgets')
      .insert({ user_id: userA.id, category_id: expenseCatA, period_month: '2026-11-01', limit_amount: 500000 })
      .select('id')
      .single();
    expect(budgetError).toBeNull();
    budgetA = budget!.id;

    const { data: goal, error: goalError } = await clientA
      .from('goals')
      .insert({ user_id: userA.id, name: `Meta ${stamp}`, target_amount: 1000000 })
      .select('id')
      .single();
    expect(goalError).toBeNull();
    goalA = goal!.id;
  });

  describe('budgets', () => {
    it('A can read own budget', async () => {
      const { data } = await clientA.from('budgets').select('id').eq('id', budgetA).single();
      expect(data?.id).toBe(budgetA);
    });

    it('B cannot read A budget', async () => {
      const { data } = await clientB.from('budgets').select('id').eq('id', budgetA);
      expect(data).toEqual([]);
    });

    it('anon cannot read budgets', async () => {
      const { data } = await anon.from('budgets').select('id').eq('id', budgetA);
      expect(data ?? []).toEqual([]);
    });

    it('B cannot update A budget', async () => {
      const { data } = await clientB.from('budgets').update({ limit_amount: 1 }).eq('id', budgetA).select();
      expect(data).toEqual([]);
    });

    it('A cannot insert a budget owned by B', async () => {
      const { error } = await clientA
        .from('budgets')
        .insert({ user_id: userB.id, category_id: expenseCatA, period_month: '2026-12-01', limit_amount: 1 });
      expect(error).not.toBeNull();
    });

    it('blocks a budget on a category owned by another user', async () => {
      const { error } = await clientB
        .from('budgets')
        .insert({ user_id: userB.id, category_id: expenseCatA, period_month: '2026-11-01', limit_amount: 1 });
      // El trigger BEFORE (categoría de gasto del propio usuario) salta antes que la FK compuesta.
      expect(error).not.toBeNull();
    });

    it('rejects a budget on an INCOME category', async () => {
      const { error } = await clientA
        .from('budgets')
        .insert({ user_id: userA.id, category_id: incomeCatA, period_month: '2026-11-01', limit_amount: 1 });
      expect(error).not.toBeNull();
      expect(error?.message).toContain('EXPENSE');
    });

    it('rejects a period_month that is not the first day', async () => {
      const { error } = await clientA
        .from('budgets')
        .insert({ user_id: userA.id, category_id: expenseCatA, period_month: '2026-10-15', limit_amount: 1 });
      expect(error).not.toBeNull();
    });

    it('rejects a non-positive limit', async () => {
      const { error } = await clientA
        .from('budgets')
        .insert({ user_id: userA.id, category_id: expenseCatA, period_month: '2027-01-01', limit_amount: 0 });
      expect(error).not.toBeNull();
    });

    it('rejects a duplicate active budget for the same category and month, allows it after soft delete', async () => {
      const dup = { user_id: userA.id, category_id: expenseCatA, period_month: '2026-11-01', limit_amount: 1 };
      const { error } = await clientA.from('budgets').insert(dup);
      expect(error).not.toBeNull();

      await clientA.from('budgets').update({ deleted_at: new Date().toISOString() }).eq('id', budgetA);
      const { error: afterDelete } = await clientA.from('budgets').insert(dup);
      expect(afterDelete).toBeNull();
    });
  });

  describe('goals', () => {
    it('A can read own goal, B cannot, anon cannot', async () => {
      const { data: own } = await clientA.from('goals').select('id').eq('id', goalA).single();
      expect(own?.id).toBe(goalA);
      const { data: other } = await clientB.from('goals').select('id').eq('id', goalA);
      expect(other).toEqual([]);
      const { data: anonRead } = await anon.from('goals').select('id').eq('id', goalA);
      expect(anonRead ?? []).toEqual([]);
    });

    it('B cannot update A goal', async () => {
      const { data } = await clientB.from('goals').update({ name: 'hack' }).eq('id', goalA).select();
      expect(data).toEqual([]);
    });

    it('rejects non-positive target and negative initial amounts', async () => {
      const bad1 = await clientA.from('goals').insert({ user_id: userA.id, name: 'x', target_amount: 0 });
      expect(bad1.error).not.toBeNull();
      const bad2 = await clientA
        .from('goals')
        .insert({ user_id: userA.id, name: 'x', target_amount: 10, initial_amount: -1 });
      expect(bad2.error).not.toBeNull();
    });
  });

  describe('goal_contributions', () => {
    it('A can contribute to own goal', async () => {
      const { error } = await clientA
        .from('goal_contributions')
        .insert({ user_id: userA.id, goal_id: goalA, amount: 50000 });
      expect(error).toBeNull();
    });

    it('composite FK blocks B contributing to A goal', async () => {
      const { error } = await clientB
        .from('goal_contributions')
        .insert({ user_id: userB.id, goal_id: goalA, amount: 1 });
      expect(error).not.toBeNull();
      expect(error?.message).toContain('goal_contributions_goal_fk');
    });

    it('B cannot read A contributions', async () => {
      const { data } = await clientB.from('goal_contributions').select('id').eq('goal_id', goalA);
      expect(data).toEqual([]);
    });

    it('rejects a non-positive amount', async () => {
      const { error } = await clientA
        .from('goal_contributions')
        .insert({ user_id: userA.id, goal_id: goalA, amount: 0 });
      expect(error).not.toBeNull();
    });
  });
});


describe('recurring_transactions', () => {
  const stamp = Date.now();
  let accountA: string;
  let expenseCatA: string;
  let incomeCatA: string;
  let recurringA: string;

  beforeAll(async () => {
    const { data: acc } = await service
      .from('accounts')
      .insert({ user_id: userA.id, name: `Cuenta rec ${stamp}`, type: 'CHECKING', opening_balance: 0 })
      .select('id')
      .single();
    const { data: exp } = await service
      .from('categories')
      .insert({ user_id: userA.id, name: `Gasto rec ${stamp}`, type: 'EXPENSE' })
      .select('id')
      .single();
    const { data: inc } = await service
      .from('categories')
      .insert({ user_id: userA.id, name: `Ingreso rec ${stamp}`, type: 'INCOME' })
      .select('id')
      .single();
    accountA = acc!.id;
    expenseCatA = exp!.id;
    incomeCatA = inc!.id;

    const { data, error } = await clientA
      .from('recurring_transactions')
      .insert({
        user_id: userA.id,
        name: 'Arriendo',
        type: 'EXPENSE',
        amount: 1000,
        account_id: accountA,
        category_id: expenseCatA,
        frequency: 'MONTHLY',
        start_date: '2026-11-01',
        next_execution_date: '2026-11-01',
      })
      .select('id')
      .single();
    expect(error).toBeNull();
    recurringA = data!.id;
  });

  const base = () => ({
    user_id: userA.id,
    name: 'x',
    type: 'EXPENSE' as const,
    amount: 1,
    account_id: accountA,
    category_id: expenseCatA,
    frequency: 'MONTHLY' as const,
    start_date: '2026-11-01',
    next_execution_date: '2026-11-01',
  });

  it('B cannot read or update A recurrence; anon cannot read', async () => {
    const { data: read } = await clientB.from('recurring_transactions').select('id').eq('id', recurringA);
    expect(read).toEqual([]);
    const { data: upd } = await clientB.from('recurring_transactions').update({ name: 'hack' }).eq('id', recurringA).select();
    expect(upd).toEqual([]);
    const { data: anonRead } = await anon.from('recurring_transactions').select('id').eq('id', recurringA);
    expect(anonRead ?? []).toEqual([]);
  });

  it('B cannot create a recurrence on A account', async () => {
    const { error } = await clientB.from('recurring_transactions').insert({ ...base(), user_id: userB.id });
    expect(error).not.toBeNull();
  });

  it('rejects a category of a different type', async () => {
    const { error } = await clientA.from('recurring_transactions').insert({ ...base(), category_id: incomeCatA });
    expect(error).not.toBeNull();
    expect(error?.message).toContain('mismo tipo');
  });

  it('CUSTOM requires a positive interval and other frequencies forbid it', async () => {
    const noInterval = await clientA.from('recurring_transactions').insert({ ...base(), frequency: 'CUSTOM' });
    expect(noInterval.error).not.toBeNull();
    const zero = await clientA.from('recurring_transactions').insert({ ...base(), frequency: 'CUSTOM', custom_interval_days: 0 });
    expect(zero.error).not.toBeNull();
    const extra = await clientA.from('recurring_transactions').insert({ ...base(), custom_interval_days: 5 });
    expect(extra.error).not.toBeNull();
    const ok = await clientA.from('recurring_transactions').insert({ ...base(), frequency: 'CUSTOM', custom_interval_days: 10 });
    expect(ok.error).toBeNull();
  });

  it('rejects a non-positive amount and next date before start date', async () => {
    const zero = await clientA.from('recurring_transactions').insert({ ...base(), amount: 0 });
    expect(zero.error).not.toBeNull();
    const early = await clientA.from('recurring_transactions').insert({ ...base(), next_execution_date: '2026-10-01' });
    expect(early.error).not.toBeNull();
  });

  it('the same occurrence cannot be registered twice (idempotency in the database)', async () => {
    const occurrence = {
      user_id: userA.id,
      account_id: accountA,
      category_id: expenseCatA,
      type: 'EXPENSE' as const,
      direction: 'OUTFLOW' as const,
      amount: 1000,
      description: 'Arriendo',
      transaction_date: '2026-11-01',
      recurring_transaction_id: recurringA,
    };
    const first = await clientA.from('transactions').insert(occurrence);
    expect(first.error).toBeNull();
    const second = await clientA.from('transactions').insert(occurrence);
    expect(second.error?.code).toBe('23505');
  });

  it('B cannot link a transaction to A recurrence', async () => {
    const { data: accB } = await service
      .from('accounts')
      .insert({ user_id: userB.id, name: `Cuenta B ${stamp}`, type: 'CHECKING', opening_balance: 0 })
      .select('id')
      .single();
    const { data: catB } = await service
      .from('categories')
      .insert({ user_id: userB.id, name: `Gasto B ${stamp}`, type: 'EXPENSE' })
      .select('id')
      .single();
    const { error } = await clientB.from('transactions').insert({
      user_id: userB.id,
      account_id: accB!.id,
      category_id: catB!.id,
      type: 'EXPENSE',
      direction: 'OUTFLOW',
      amount: 1,
      description: 'x',
      transaction_date: '2026-11-02',
      recurring_transaction_id: recurringA,
    });
    expect(error).not.toBeNull();
    expect(error?.message).toContain('transactions_recurring_fk');
  });
});
