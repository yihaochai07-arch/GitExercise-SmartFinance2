import { useState, useEffect } from 'react'
import { supabase, Account } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type UseAccountsReturn = {
    accounts: Account[]
    totalBalance: number
    loading: boolean
    error: string | null
    addAccount: (account: Omit<Account, 'id' | 'created_at' | 'user_id'>) => Promise<Account | null>
    refetch: () => Promise<void>
}

export function useAccounts(): UseAccountsReturn {
    const { user } = useAuth()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) fetchAccounts()
    }, [user])

    async function fetchAccounts() {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)

            if (error) throw error
            setAccounts(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
        } finally {
            setLoading(false)
        }
    }

    async function addAccount(account: Omit<Account, 'id' | 'created_at' | 'user_id'>): Promise<Account | null> {
        if (!user) return null
        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert([{ ...account, user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            setAccounts(prev => [...prev, data])
            return data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add account')
            return null
        }
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.opening_balance, 0)

    return { accounts, totalBalance, loading, error, addAccount, refetch: fetchAccounts }
}
