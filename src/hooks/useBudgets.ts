import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Budget = {
    id: string
    category_id: string
    limit: number
    period: "monthly" | "weekly"
    created_at: string
}

export type BudgetStatus = "safe" | "warning" | "exceeded"

type UseBudgetsReturn = {
    budgets: Budget[]
    getBudgetStatus: (spent: number, limit: number) => BudgetStatus
    loading: boolean
    error: string | null
}

export function useBudgets(): UseBudgetsReturn {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBudgets()
    }, [])

    async function fetchBudgets() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('budgets')
                .select('*')

            if (error) throw error
            setBudgets(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
        } finally {
            setLoading(false)
        }
    }
    
    function getBudgetStatus(spent: number, limit: number): BudgetStatus {
        const ratio = spent / limit

        if (ratio < 0.8) return "safe"
        if (ratio < 1) return "warning"
        return "exceeded"
    }

    return { budgets, getBudgetStatus, loading, error }
}