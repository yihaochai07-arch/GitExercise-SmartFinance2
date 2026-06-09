import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type Transaction = {
    id: string
    amount: number
    type: "income" | "expense"
    category_id: string
    account_id: string
    user_id: string
    date: string
    created_at: string
}

type NewTransaction = Omit<Transaction, "id" | "created_at" | "user_id">

type UseTransactionsReturn = {
    transactions: Transaction[]
    totalExpense: number
    totalIncome: number
    loading: boolean
    error: string | null
    addTransaction: (t: NewTransaction) => Promise<Transaction | null>
}

export function useTransactions(): UseTransactionsReturn {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTransactions()
    }, [user])

    async function fetchTransactions() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
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
            const transaction = { ...t, user_id: user.id }
            const { data, error } = await supabase
                .from('transactions')
                .insert([transaction])
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

    const totalExpense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { transactions, totalExpense, totalIncome, loading, error, addTransaction }
}