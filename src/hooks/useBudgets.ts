import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'   
export type Budget = {
    id: string
    user_id: string                                 
    limit: number
    period: "monthly" | "weekly"
    created_at: string
}

export type BudgetStatus = "safe" | "warning" | "exceeded"

type UseBudgetsReturn = {
    budgets: Budget[]
    getBudgetStatus: (spent: number, limit: number) => BudgetStatus
    addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>) => Promise<Budget | null> 
    error: string | null
}

export function useBudgets(): UseBudgetsReturn {
    const { user } = useAuth()                     
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) fetchBudgets()                   
    }, [user])                                     

    async function fetchBudgets() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user!.id)            

            if (error) throw error
            setBudgets(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
        } finally {
            setLoading(false)
        }
    }


    async function addBudget(
        budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>
    ): Promise<Budget | null> {
        if (!user) return null
        try {
            const { data, error } = await supabase
                .from('budgets')
                .insert([{ ...budget, user_id: user.id }])
                .select()
                .single()
            if (error) throw error
            setBudgets(prev => [...prev, data])
            return data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add budget')
            return null
        }
    }
    // ── END of new function ───────────────────────────────────────

    function getBudgetStatus(spent: number, limit: number): BudgetStatus {
        const ratio = spent / limit
        if (ratio < 0.8) return "safe"
        if (ratio < 1) return "warning"
        return "exceeded"
    }

    return { budgets, getBudgetStatus, addBudget, error }  
}