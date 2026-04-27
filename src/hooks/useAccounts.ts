export interface Account {
  id: string;
  user_id: string;
  name: string;
  platform_type: 'cash' | 'bank' | 'ewallet_tng' | 'ewallet_grabpay';
  opening_balance: number;
  created_at: string;
  updated_at: string;
}

export function useAccounts() {
  return {
    accounts: [] as Account[],
    loading: false,
    error: null as string | null,
    addAccount: async (_name: string, _platformType: Account['platform_type'], _openingBalance: number) => undefined,
    updateAccount: async (_id: string, _updates: Partial<Account>) => undefined,
    deleteAccount: async (_id: string) => undefined,
  };
}
