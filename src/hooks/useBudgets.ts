export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  limit_amount: number;
  period: 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export function useBudgets() {
  return {
    budgets: [] as Budget[],
    loading: false,
    error: null as string | null,
    addBudget: async (_categoryId: string, _limitAmount: number, _period: 'weekly' | 'monthly') => undefined,
    updateBudget: async (_id: string, _updates: Partial<Budget>) => undefined,
    deleteBudget: async (_id: string) => undefined,
  };
}
