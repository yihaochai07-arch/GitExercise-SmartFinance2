import { useCallback, useEffect, useState } from 'react'
import { Account, supabase } from '../lib/supabase'
import { useAccounts } from './useAccounts'
import {
  PROVIDERS,
  PROVIDER_MAP,
  PROVIDER_BY_NAME,
  getMockBalance,
  COUNTRY_LABELS,
  ProviderConfig,
} from '../services/mockProviders'
import { generateMockTransactions } from '../services/mockTransactions'
import { useAuth } from '../context/AuthContext'

const TO_MYR: Record<string, number> = {
  MYR: 1,
  SGD: 3.30,
  IDR: 1 / 360,
  USD: 4.45,
}

export type WalletAccount = Account & {
  provider: ProviderConfig
  liveBalance: number
  displayBalance: string
  isLive: boolean
  isLoading: boolean
  error: string | null
}

export type WalletGroup = {
  country: 'ID' | 'SG' | 'MY'
  label: string
  accounts: WalletAccount[]
  subtotal: string
}

function formatBalance(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(amount)
}

// Fetch net transaction delta per account (income - expense)
async function fetchTransactionDeltas(
  accountIds: string[]
): Promise<Record<string, number>> {
  if (accountIds.length === 0) return {}

  const { data, error } = await supabase
    .from('transactions')
    .select('account_id, amount, type')
    .in('account_id', accountIds)

  if (error || !data) return {}

  const deltas: Record<string, number> = {}
  for (const txn of data) {
    if (!txn.account_id) continue
    const prev = deltas[txn.account_id] ?? 0
    deltas[txn.account_id] = txn.type === 'income'
      ? prev + txn.amount
      : prev - txn.amount
  }
  return deltas
}

async function seedTransactions(
  accountId: string,
  userId: string,
  currency: string,
  isEwallet: boolean,
) {
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
  if ((count ?? 0) > 0) return

  const { data: cats } = await supabase
    .from('transaction_categories')
    .select('id, name')
  if (!cats || cats.length === 0) return

  const txns = generateMockTransactions(accountId, userId, currency, isEwallet, cats)
  if (txns.length === 0) return

  for (let i = 0; i < txns.length; i += 100) {
    await supabase.from('transactions').insert(txns.slice(i, i + 100))
  }
}

export function useWallet() {
  const { user } = useAuth()
  const { accounts, loading: accountsLoading, error: accountsError, addAccount, deleteAccount, refetch } = useAccounts()

  // Store transaction deltas per account
  const [txnDeltas, setTxnDeltas] = useState<Record<string, number>>({})
  const [deltasLoading, setDeltasLoading] = useState(false)

  // Fetch deltas whenever accounts change
  useEffect(() => {
    if (accounts.length === 0) return
    setDeltasLoading(true)
    fetchTransactionDeltas(accounts.map(a => a.id))
      .then(setTxnDeltas)
      .finally(() => setDeltasLoading(false))
  }, [accounts])

  // Enrich each account with provider config + balance
  const walletAccounts: WalletAccount[] = accounts.map(account => {
    const provider =
      PROVIDER_BY_NAME[account.name.toLowerCase()] ??
      Object.values(PROVIDER_MAP).find(
        p => p.name.toLowerCase() === account.name.toLowerCase()
      ) ??
      PROVIDERS[0]

    const delta = txnDeltas[account.id] ?? 0

    let liveBalance: number
    if (provider.id === 'cash') {
      // Cash on Hand: balance is purely from transactions (starts at 0)
      liveBalance = delta
    } else {
      // Bank/ewallet: mock base balance adjusted by real transaction delta
      const mockBase = getMockBalance(account.id, provider.mockBalanceRange)
      liveBalance = mockBase + delta
    }

    // Ensure balance never goes below 0
    liveBalance = Math.max(0, liveBalance)

    return {
      ...account,
      provider,
      liveBalance,
      displayBalance: formatBalance(liveBalance, account.currency),
      isLive: false,
      isLoading: false,
      error: null,
    }
  })

  // Group by country
  const groupOrder: Array<'ID' | 'SG' | 'MY'> = ['SG', 'MY', 'ID']
  const groups: WalletGroup[] = groupOrder
    .map(country => {
      const grouped = walletAccounts.filter(a => a.provider.country === country)
      if (grouped.length === 0) return null
      const currency = grouped[0].currency
      const subtotalAmount = grouped.reduce((sum, a) => sum + a.liveBalance, 0)
      return {
        country,
        label: COUNTRY_LABELS[country],
        accounts: grouped,
        subtotal: formatBalance(subtotalAmount, currency),
      }
    })
    .filter((g): g is WalletGroup => g !== null)

  const totalBalanceMYR = walletAccounts.reduce((sum, a) => {
    const rate = TO_MYR[a.currency] ?? 1
    return sum + a.liveBalance * rate
  }, 0)

  const connectAccount = useCallback(async (providerId: string) => {
    const provider = PROVIDER_MAP[providerId]
    if (!provider) throw new Error(`Unknown provider: ${providerId}`)
    if (!user) throw new Error('Not authenticated')

    const isEwallet = provider.platform_type.startsWith('ewallet_')

    const account = await addAccount({
      name: provider.name,
      platform_type: provider.platform_type,
      opening_balance: getMockBalance(Date.now().toString(), provider.mockBalanceRange),
      currency: provider.currency,
      brankas_account_id: null,
    })

    if (account) {
      await seedTransactions(account.id, user.id, provider.currency, isEwallet)
    }

    await refetch()
  }, [addAccount, refetch, user])

  const getOrCreateCashAccount = useCallback(async (): Promise<string | null> => {
    const existing = walletAccounts.find(a => a.platform_type === 'cash')
    if (existing) return existing.id

    const account = await addAccount({
      name: 'Cash on Hand',
      platform_type: 'cash',
      opening_balance: 0,
      currency: 'MYR',
      brankas_account_id: null,
    })
    return account?.id ?? null
  }, [walletAccounts, addAccount])

  const withdrawCash = useCallback(async (
    sourceAccountId: string,
    amount: number,
  ): Promise<void> => {
    if (!user) throw new Error('Not authenticated')
    if (amount <= 0) throw new Error('Amount must be greater than 0')

    const cashAccountId = await getOrCreateCashAccount()
    if (!cashAccountId) throw new Error('Failed to create cash account')

    const sourceAccount = walletAccounts.find(a => a.id === sourceAccountId)
    if (!sourceAccount) throw new Error('Source account not found')

    // Insert expense on source bank account
    const { error: expenseError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: sourceAccountId,
        amount,
        type: 'expense',
        category_id: null,
        date: new Date().toISOString().split('T')[0],
      })
    if (expenseError) throw expenseError

    // Insert income on cash account
    const { error: incomeError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        account_id: cashAccountId,
        amount,
        type: 'income',
        category_id: null,
        date: new Date().toISOString().split('T')[0],
      })
    if (incomeError) throw incomeError

    // Refresh transaction deltas immediately after withdrawal
    const updatedDeltas = await fetchTransactionDeltas(accounts.map(a => a.id))
    setTxnDeltas(updatedDeltas)

    await refetch()
  }, [user, walletAccounts, accounts, getOrCreateCashAccount, refetch])

  return {
    groups,
    walletAccounts,
    totalBalanceMYR,
    loading: accountsLoading || deltasLoading,
    error: accountsError,
    connectAccount,
    deleteAccount,
    withdrawCash,
  }
}