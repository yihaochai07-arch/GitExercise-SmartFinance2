import { useCallback } from 'react'
import { Account, supabase } from '../lib/supabase'
import { useAccounts } from './useAccounts'
import {
  PROVIDERS,
  PROVIDER_MAP,
  getMockBalance,
  COUNTRY_LABELS,
  ProviderConfig,
} from '../services/mockProviders'
import { generateMockTransactions } from '../services/mockTransactions'
import { useAuth } from '../context/AuthContext'

// Approximate exchange rates for USD display (demo only)
const TO_MYR: Record<string, number> = {
  MYR: 1,
  SGD: 3.30,
  IDR: 1/360,
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

async function seedTransactions(
  accountId: string,
  userId: string,
  currency: string,
  isEwallet: boolean,
) {
  // Skip if transactions already exist for this account
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

  // Insert in batches of 100 to stay within Supabase limits
  for (let i = 0; i < txns.length; i += 100) {
    await supabase.from('transactions').insert(txns.slice(i, i + 100))
  }
}

export function useWallet() {
  const { user } = useAuth()
  const { accounts, loading: accountsLoading, error: accountsError, addAccount, deleteAccount,refetch } = useAccounts()
  // Enrich each account with provider config + mock balance
  const walletAccounts: WalletAccount[] = accounts.map(account => {
    const provider = Object.values(PROVIDER_MAP).find(p => p.name.toLowerCase() === account.name.toLowerCase())
      ?? PROVIDERS[0]
    const liveBalance = getMockBalance(account.id, provider.mockBalanceRange)

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

  return {
    groups,
    walletAccounts,
    totalBalanceMYR,
    loading: accountsLoading,
    error: accountsError,
    connectAccount,
    deleteAccount,
  }
}
