import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'   
export type Budget = {
    id: string
    user_id: string                                 
    limit: number
    period: "monthly"
    created_at: string
}

export type BudgetStatus = "safe" | "warning" | "exceeded"

type UseBudgetsReturn = {
    budgets: Budget[]
    getBudgetStatus: (spent: number, limit: number) => BudgetStatus
<<<<<<< HEAD
    loading: boolean
    saving: boolean
=======
    addBudget: (budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>) => Promise<Budget | null> 
>>>>>>> 5a2f799c2d88810dbc403cb3dc8bd0d4cef8a195
    error: string | null
    saveBudget: (category_id: string, limit: number) => Promise<{ data: Budget | null; error: string | null }>
}

export function useBudgets(): UseBudgetsReturn {
    const { user } = useAuth()                     
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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

<<<<<<< HEAD
    async function saveBudget(category_id: string, limit: number): Promise<{ data: Budget | null; error: string | null }> {
        try {
            setSaving(true)
            setError(null)
            const existingBudget = budgets.find((budget) => String(budget.category_id) === String(category_id))

            if (existingBudget) {
                const { data, error } = await supabase
                    .from('budgets')
                    .update({ limit })
                    .eq('id', existingBudget.id)
                    .select('*')
                    .single()

                if (error) throw error
                setBudgets((prev) => prev.map((budget) => budget.id === existingBudget.id ? data : budget))
                return { data, error: null }
            }

            const { data, error } = await supabase
                .from('budgets')
                .insert([{ category_id, limit, period: 'monthly' }])
                .select('*')
                .single()

            if (error) throw error
            setBudgets((prev) => [...prev, data])
            return { data, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save budget'
            setError(message)
            return { data: null, error: message }
        } finally {
            setSaving(false)
        }
    }
    
=======

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

>>>>>>> 5a2f799c2d88810dbc403cb3dc8bd0d4cef8a195
    function getBudgetStatus(spent: number, limit: number): BudgetStatus {
        const ratio = spent / limit
        if (ratio < 0.8) return "safe"
        if (ratio < 1) return "warning"
        return "exceeded"
    }

<<<<<<< HEAD
    return { budgets, getBudgetStatus, loading, saving, error, saveBudget }
=======
    return { budgets, getBudgetStatus, addBudget, error }  
>>>>>>> 5a2f799c2d88810dbc403cb3dc8bd0d4cef8a195
}