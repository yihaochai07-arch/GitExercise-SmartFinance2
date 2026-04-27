export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export function useCategories() {
  return {
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
  };
}
