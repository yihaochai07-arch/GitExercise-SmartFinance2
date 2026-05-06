import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Transaction = {
    id: string
    amount: number
    type: "income" | "expense"
    category_id: string
    account_id: string
    date: string
    created_at: string
}

type UseTransactionsReturn = {
    transactions: Transaction[]
    totalExpense: number
    totalIncome: number
    loading: boolean
    error: string | null
    addTransaction: (t: Omit<Transaction, "id" | "created_at">) => Promise<void>
}

export function useTransactions(): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTransactions()
    }, [])

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

    async function addTransaction(t: Omit<Transaction, "id" | "created_at">) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([t])
                .select()
                .single()

            if (error) throw error
            setTransactions(prev => [data, ...prev])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add transaction')
        }
    }

    const totalExpense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

    return { transactions, totalExpense, totalIncome, loading, error, addTransaction }
}