import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const SUPABASE_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

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
      await service.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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