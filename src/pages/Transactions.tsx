import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, LayoutList } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'

export default function Transactions() {
  const { transactions, totalIncome, totalExpense, loading, error, addTransaction } = useTransactions()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const [filterAccountId, setFilterAccountId] = useState<string>('all')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAccountId, setWithdrawAccountId] = useState('')
  const [withdrawCategoryId, setWithdrawCategoryId] = useState('')
  const [withdrawDate, setWithdrawDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const bankCategories = useMemo(
    () => categories.filter(c => c.name.toLowerCase().includes('bank')),
    [categories]
  )

  useEffect(() => {
    if (!withdrawAccountId && accounts.length > 0) {
      setWithdrawAccountId(accounts[0].id)
    }
  }, [accounts, withdrawAccountId])

  useEffect(() => {
    if (!withdrawCategoryId && bankCategories.length > 0) {
      setWithdrawCategoryId(bankCategories[0].id)
    }
  }, [bankCategories, withdrawCategoryId])

  async function handleAddWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormMessage(null)
    setFormError(null)

    const amountValue = Number(withdrawAmount)
    if (!withdrawAccountId || !withdrawCategoryId) {
      setFormError('Please select an account and category.')
      return
    }

    if (bankCategories.length === 0) {
      setFormError('No bank account categories are available.')
      return
    }

    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setFormError('Please enter a valid withdrawal amount.')
      return
    }

    await addTransaction({
      amount: amountValue,
      type: 'expense',
      category_id: withdrawCategoryId,
      account_id: withdrawAccountId,
      date: withdrawDate,
    })

    if (!error) {
      setFormMessage('Withdrawal recorded successfully.')
      setWithdrawAmount('')
      setWithdrawDate(new Date().toISOString().slice(0, 10))
    }
  }

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c])),
    [categories]
  )
  const accountMap = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id, a])),
    [accounts]
  )

  const filtered = useMemo(
    () => filterAccountId === 'all' ? transactions : transactions.filter(t => t.account_id === filterAccountId),
    [transactions, filterAccountId]
  )

  // Group by date (YYYY-MM-DD), sorted newest first
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric',
    })
  }

  function formatAmount(amount: number, currency: string, type: 'income' | 'expense') {
    const formatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(amount)
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-pink-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Your recent activity</p>
          </div>
          {accounts.length > 0 && (
            <select
              value={filterAccountId}
              onChange={e => setFilterAccountId(e.target.value)}
              className="bg-[#0a0a0a] border border-white/[0.06] text-white/60 text-sm rounded-xl px-3 py-2 outline-none focus:border-white/[0.12] cursor-pointer"
            >
              <option value="all">All accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Withdrawal record form */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Record withdrawal</h2>
              <p className="text-sm text-white/40">Save a new withdrawal transaction to your account history.</p>
            </div>
          </div>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleAddWithdrawal}>
            <label className="space-y-2 text-sm text-white/70">
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#050505] px-3 py-2 text-white outline-none focus:border-white/[0.16]"
                placeholder="100.00"
              />
            </label>
            <label className="space-y-2 text-sm text-white/70">
              Date
              <input
                type="date"
                value={withdrawDate}
                onChange={e => setWithdrawDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#050505] px-3 py-2 text-white outline-none focus:border-white/[0.16]"
              />
            </label>
            <label className="space-y-2 text-sm text-white/70">
              Account
              <select
                value={withdrawAccountId}
                onChange={e => setWithdrawAccountId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#050505] px-3 py-2 text-white outline-none focus:border-white/[0.16]"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-white/70">
              Category
              <select
                value={withdrawCategoryId}
                onChange={e => setWithdrawCategoryId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#050505] px-3 py-2 text-white outline-none focus:border-white/[0.16]"
              >
                {bankCategories.length === 0 ? (
                  <option value="" disabled>No bank account categories found</option>
                ) : (
                  bankCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))
                )}
              </select>
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Save withdrawal
              </button>
            </div>
          </form>
          {formError && <p className="mt-3 text-sm text-rose-400">{formError}</p>}
          {formMessage && <p className="mt-3 text-sm text-emerald-400">{formMessage}</p>}
        </div>

        {/* Summary */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={13} className="text-emerald-400/60" />
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Income</p>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                +{new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalIncome)}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={13} className="text-rose-400/60" />
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Expenses</p>
              </div>
              <p className="text-xl font-bold text-rose-400">
                -{new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(totalExpense)}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <LayoutList size={24} className="text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white/60 mb-2">No transactions yet</h2>
            <p className="text-sm text-white/25 font-light max-w-xs">
              Connect an account to see your transaction history here.
            </p>
          </div>
        )}

        {/* Transaction groups */}
        {!loading && grouped.map(([date, txns]) => (
          <div key={date} className="mb-8">
            <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-3">
              {formatDate(date)}
            </p>
            <div className="space-y-1">
              {txns.map(t => {
                const category = categoryMap[t.category_id]
                const account = accountMap[t.account_id]
                const currency = account?.currency ?? 'MYR'
                const isIncome = t.type === 'income'
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] hover:scale-[1.01] transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none w-8 text-center">
                        {category?.icon ?? '📦'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white/80">
                          {category?.name ?? 'Other'}
                        </p>
                        {account && (
                          <p className="text-xs text-white/30 mt-0.5">{account.name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatAmount(t.amount, currency, t.type)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
