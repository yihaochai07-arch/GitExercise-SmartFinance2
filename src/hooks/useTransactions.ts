export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  direction: 'income' | 'expense';
  category_id: string | null;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export function useTransactions() {
  return {
    transactions: [] as Transaction[],
    loading: false,
    error: null as string | null,
    addTransaction: async (
      _accountId: string,
      _amount: number,
      _direction: 'income' | 'expense',
      _categoryId: string | null,
      _description: string,
      _date: string
    ) => undefined,
    updateTransaction: async (_id: string, _updates: Partial<Transaction>) => undefined,
    deleteTransaction: async (_id: string) => undefined,
  };
}
