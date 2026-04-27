export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  target_amount: number;
  saved_amount: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useGoals() {
  return {
    goals: [] as Goal[],
    loading: false,
    error: null as string | null,
    addGoal: async (_name: string, _description: string | null, _targetAmount: number) => undefined,
    updateGoal: async (_id: string, _updates: Partial<Goal>) => undefined,
    deleteGoal: async (_id: string) => undefined,
  };
}
