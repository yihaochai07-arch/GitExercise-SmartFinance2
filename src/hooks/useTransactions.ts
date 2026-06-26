import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type Transaction = {
    id: string
    user_id: string
    amount: number
    type: 'income' | 'expense'
    category_id: string
    account_id: string
    date: string
    note: string | null
    created_at: string
}

type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'user_id'> & {
  category_id: string | null
}

type UseTransactionsReturn = {
    transactions: Transaction[]
    totalExpense: number
    totalIncome: number
    loading: boolean
    error: string | null
    addTransaction: (t: NewTransaction) => Promise<Transaction | null>
    deleteTransaction: (id: string) => Promise<boolean>
}

export function useTransactions(): UseTransactionsReturn {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) fetchTransactions()
    }, [user])

    async function fetchTransactions() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user!.id)
                .order('date', { ascending: false })

            if (error) throw error
            setTransactions(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
        } finally {
            setLoading(false)
        }
    }

    async function addTransaction(t: NewTransaction): Promise<Transaction | null> {
        if (!user) {
            setError('Not authenticated')
            return null
        }
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...t, user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            setTransactions(prev => [data, ...prev])
            return data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add transaction')
            return null
        }
    }

    async function deleteTransaction(id: string): Promise<boolean> {
        if (!user) return false
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) throw error
            setTransactions(prev => prev.filter(t => t.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete transaction')
            return false
        }
    }

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { transactions, totalExpense, totalIncome, loading, error, addTransaction, deleteTransaction }
}
