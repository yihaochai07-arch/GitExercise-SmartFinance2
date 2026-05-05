type Transaction = {
  amount: number;
  category?: string;
  date?: string;
};

type Budget = {
  category: string;
  limit: number;
  spent?: number;
};

type Goal = {
  name: string;
  targetAmount: number;
  currentAmount?: number;
};

export function useSummary(
  { transactions, budgets, goals }: { transactions: Transaction[]; budgets: Budget[]; goals: Goal[]; }
) {
  const totalSpending = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const budgetStatus = budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.category === budget.category)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    return {
      category: budget.category,
      limit: budget.limit,
      spent,
      remaining: budget.limit - spent,
      overLimit: spent > budget.limit,
    };
  });

  const goalProgress = goals.map((goal) => {
    const currentAmount = goal.currentAmount ?? 0;
    const progress = goal.targetAmount > 0 ? Math.min((currentAmount / goal.targetAmount) * 100, 100) : 0;

    return {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount,
      progress,
    };
  });

  const safetyFund = Math.round(totalSpending * 0.2);

  return {
    totalSpending,
    budgetStatus,
    goalProgress,
    safetyFund,
  };
}