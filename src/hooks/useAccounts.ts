import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Account = {
    id: string
    name: string
    balance: number
    created_at: string
}

type UseAccountsReturn = {
    accounts: Account[]
    totalBalance: number
    loading: boolean
    error: string | null
    addAccount: (account: Omit<Account, "id" | "created_at">) => Promise<void>
}

export function useAccounts(): UseAccountsReturn {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAccounts()
    }, [])

    async function fetchAccounts() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('accounts')
                .select('*')

            if (error) throw error
            setAccounts(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
        } finally {
            setLoading(false)
        }
    }

    async function addAccount(account: Omit<Account, "id" | "created_at">) {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert([account])
                .select()
                .single()

            if (error) throw error
            setAccounts(prev => [...prev, data])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add account')
        }
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    return { accounts, totalBalance, loading, error, addAccount }
}