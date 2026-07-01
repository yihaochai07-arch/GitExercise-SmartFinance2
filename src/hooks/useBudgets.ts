import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'   
export type Budget = {
    id: string
    user_id: string
    category_id: string
    limit: number
    period: 'monthly'
    created_at: string
}

type UseBudgetsReturn = {
    budgets: Budget[]
    loading: boolean
    saving: boolean
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
                setBudgets((prev) => prev.map((budget) => (budget.id === existingBudget.id ? data : budget)))
                return { data, error: null }
            }

            const { data, error } = await supabase
                .from('budgets')
                .insert([{ category_id, limit, period: 'monthly', user_id: user!.id }])
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

    return { budgets, loading, saving, error, saveBudget }
}