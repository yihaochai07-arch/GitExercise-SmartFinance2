import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Account = {
  id: string;
  user_id: string;
  name: string;
  platform_type: 'cash' | 'bank_id' | 'bank_sg' | 'bank_my' | 'ewallet_gopay' | 'ewallet_shopeepay' | 'ewallet_tng';
  opening_balance: number;
  currency: string;
  brankas_account_id: string | null;
  created_at: string;
};

export const getAccountsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};
