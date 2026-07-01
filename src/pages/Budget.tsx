import { useMemo, useState, useEffect, type CSSProperties, type FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useBudgets, type Budget } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type LoanDirection = 'borrowed_from' | 'lent_to'

type LoanRecord = {
  id: string
  person: string
  amount: number
  direction: LoanDirection
  accountName: string
  date: string
}

type BudgetWithStats = Budget & {
  categoryName: string
  icon: string
  color: string
  spent: number
  remaining: number
  percentage: number
  status: 'on-track' | 'near-limit' | 'over-budget'
}

type BudgetSummary = {
  totalBudget: number
  totalSpent: number
  balance: number
  percentageUsed: number
  overBudgetCount: number
}

function getStatus(pct: number): BudgetWithStats['status'] {
  if (pct >= 100) return 'over-budget'
  if (pct >= 80) return 'near-limit'
  return 'on-track'
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getDaysRemainingInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate()
}

interface MetricCardProps {
  label: string
  value: string
  sub: string
  valueColor?: string
  subColor?: string
}

function MetricCard({ label, value, sub, valueColor, subColor }: MetricCardProps) {
  return (
    <div style={{
      backgroundColor: '#000',
      borderRadius: '14px',
      padding: '1rem',
      minWidth: 0,
      minHeight: '104px',
    }}>
      <p style={{ fontSize: '12px', color: '#ccc', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 600, margin: 0, color: valueColor ?? '#fff' }}>
        {value}
      </p>
      <p style={{ fontSize: '12px', margin: '4px 0 0', color: subColor ?? '#aaa' }}>{sub}</p>
    </div>
  )
}

export default function BudgetPage() {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [manualBudget, setManualBudget] = useState<string>('')
  const [isSavingBudget, setIsSavingBudget] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error' | null>(null)
  const [showManualBudget, setShowManualBudget] = useState(false)

  // Loan form state
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [loanDirection, setLoanDirection] = useState<LoanDirection>('borrowed_from')
  const [loanPerson, setLoanPerson] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [loanAccountId, setLoanAccountId] = useState('')
  const [loanFormMessage, setLoanFormMessage] = useState<string | null>(null)
  const [loanFormError, setLoanFormError] = useState<string | null>(null)
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [settledLoanIds, setSettledLoanIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = window.localStorage.getItem('settledLoanIds')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const loanYear = String(today.getFullYear())
  const [loanMonth, setLoanMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
  const [loanDay, setLoanDay] = useState(String(today.getDate()).padStart(2, '0'))
  const [loanDate, setLoanDate] = useState(
    () => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )

  const { categories, loading: catLoading, error: catError } = useCategories()
  const { budgets, loading: budgetsLoading, error: budgetsError, saveBudget } = useBudgets()
  const { transactions, loading: txLoading, error: txError, addTransaction } = useTransactions()
  const { accounts } = useAccounts()

  // Loan date sync
  useEffect(() => {
    const daysInMonth = new Date(Number(loanYear), Number(loanMonth), 0).getDate()
    if (Number(loanDay) > daysInMonth) setLoanDay(String(daysInMonth).padStart(2, '0'))
  }, [loanMonth, loanDay, loanYear])

  useEffect(() => {
    setLoanDate(`${loanYear}-${loanMonth}-${loanDay}`)
  }, [loanMonth, loanDay, loanYear])

  useEffect(() => {
    if (!loanAccountId && accounts.length > 0) setLoanAccountId(accounts[0].id)
  }, [accounts, loanAccountId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('settledLoanIds', JSON.stringify(settledLoanIds))
    }
  }, [settledLoanIds])

  // Derive loan records from transactions with loan notes
  const loanRecords = useMemo<LoanRecord[]>(() => {
    return transactions
      .filter(t => t.note && /^(Borrowed from|Lent to):/i.test(t.note))
      .map(t => {
        const isBorrowed = /^Borrowed from:/i.test(t.note!)
        const person = t.note!.replace(/^(Borrowed from|Lent to):\s*/i, '')
        const account = accounts.find(a => a.id === t.account_id)
        return {
          id: t.id,
          person,
          amount: t.amount,
          direction: (isBorrowed ? 'borrowed_from' : 'lent_to') as LoanDirection,
          accountName: account?.name ?? '—',
          date: t.date,
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, accounts])

  const loanSummary = useMemo(() => {
    const activeLoanRecords = loanRecords.filter((loan) => !settledLoanIds.includes(loan.id))
    const totalBorrowed = activeLoanRecords
      .filter((loan) => loan.direction === 'borrowed_from')
      .reduce((sum, loan) => sum + loan.amount, 0)
    const totalLent = activeLoanRecords
      .filter((loan) => loan.direction === 'lent_to')
      .reduce((sum, loan) => sum + loan.amount, 0)
    return { totalBorrowed, totalLent, net: totalBorrowed - totalLent }
  }, [loanRecords, settledLoanIds])

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date)
      return date.getMonth() === viewMonth && date.getFullYear() === viewYear
    })
  }, [transactions, viewMonth, viewYear])

  const spendByCategory = useMemo(() => {
    return monthlyTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category_id] = (acc[transaction.category_id] ?? 0) + Math.abs(transaction.amount)
        return acc
      }, {})
  }, [monthlyTransactions])

  const budgetCategories = useMemo(() => {
    return categories.filter((category) => category.name !== 'Salary')
  }, [categories])

  const categoryMap = useMemo(() => {
    return Object.fromEntries(categories.map((category) => [category.id, category]))
  }, [categories])

  useEffect(() => {
    if (!selectedCategoryId && budgetCategories.length > 0) {
      setSelectedCategoryId(budgetCategories[0].id)
    } else if (selectedCategoryId && !budgetCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(budgetCategories[0]?.id ?? '')
    }
  }, [budgetCategories, selectedCategoryId])

  useEffect(() => {
    if (!selectedCategoryId) return
    const existingBudget = budgets.find((budget) => String(budget.category_id) === String(selectedCategoryId))
    setManualBudget(existingBudget ? String(existingBudget.limit) : '')
  }, [selectedCategoryId, budgets])

  const enrichedBudgets = useMemo<BudgetWithStats[]>(() => {
    return budgets.map((budget) => {
      const category = categoryMap[String(budget.category_id)] ?? {
        id: 'unknown',
        name: 'Uncategorized',
        icon: '🏷️',
        color: '#c1c1c1',
      }
      const spent = spendByCategory[budget.category_id] ?? 0
      const remaining = budget.limit - spent
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      return {
        ...budget,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        spent,
        remaining,
        percentage,
        status: getStatus(percentage),
      }
    })
  }, [budgets, categoryMap, spendByCategory])

  const categoriesWithStats = useMemo(() => {
    return budgetCategories.map((category) => {
      const budget = budgets.find((b) => String(b.category_id) === String(category.id))
      const spent = spendByCategory[category.id] ?? 0
      const percentage = budget?.limit && budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      return { ...category, budgetLimit: budget?.limit, spent, percentage }
    })
  }, [budgetCategories, budgets, spendByCategory])

  const summary = useMemo<BudgetSummary>(() => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0)
    const totalSpent = enrichedBudgets.reduce((sum, budget) => sum + budget.spent, 0)
    const balance = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const overBudgetCount = enrichedBudgets.filter((budget) => budget.status === 'over-budget').length
    return { totalBudget, totalSpent, balance, percentageUsed, overBudgetCount }
  }, [budgets, enrichedBudgets])

  async function handleSaveBudget() {
    if (!selectedCategoryId) {
      setSaveMessageType('error')
      setSaveMessage('Please select a category.')
      return
    }
    const limit = Number(manualBudget)
    if (Number.isNaN(limit) || limit < 0) {
      setSaveMessageType('error')
      setSaveMessage('Please enter a valid budget amount.')
      return
    }
    setIsSavingBudget(true)
    setSaveMessage(null)
    setSaveMessageType(null)
    const { data, error } = await saveBudget(String(selectedCategoryId), limit)
    setIsSavingBudget(false)
    if (error || !data) {
      setSaveMessageType('error')
      setSaveMessage(error ?? 'Unable to save budget. Please try again.')
      return
    }
    const categoryName = categoryMap[String(selectedCategoryId)]?.name ?? 'category'
    setSaveMessageType('success')
    setSaveMessage(`Budget saved successfully for ${categoryName}.`)
  }

  async function handleAddLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoanFormMessage(null)
    setLoanFormError(null)

    const amountValue = Math.abs(Number(loanAmount))
    const personTrimmed = loanPerson.trim()

    if (!personTrimmed) { setLoanFormError('Please enter the person or party name.'); return }
    if (Number.isNaN(amountValue) || amountValue <= 0) { setLoanFormError('Please enter a valid amount.'); return }
    if (!loanAccountId) { setLoanFormError('Please select an account.'); return }

    const transactionType = loanDirection === 'borrowed_from' ? 'income' : 'expense'
    const otherCategory = categories.find(c => /^other$/i.test(c.name)) ?? categories[0]
    const noteLabel = loanDirection === 'borrowed_from'
      ? `Borrowed from: ${personTrimmed}`
      : `Lent to: ${personTrimmed}`

    setIsSubmittingLoan(true)
    const newTransaction = await addTransaction({
      amount: amountValue,
      type: transactionType,
      category_id: otherCategory?.id ?? '',
      account_id: loanAccountId,
      date: loanDate,
      note: noteLabel,
    })
    setIsSubmittingLoan(false)

    if (newTransaction) {
      setLoanFormMessage(
        loanDirection === 'borrowed_from'
          ? `Recorded: borrowed from ${personTrimmed}.`
          : `Recorded: lent to ${personTrimmed}.`
      )
      setLoanPerson('')
      setLoanAmount('')
      const r = new Date()
      setLoanMonth(String(r.getMonth() + 1).padStart(2, '0'))
      setLoanDay(String(r.getDate()).padStart(2, '0'))
      setTimeout(() => { setShowLoanForm(false); setLoanFormMessage(null) }, 1500)
    } else {
      setLoanFormError('Failed to record loan.')
    }
  }

  async function handleSettleLoan(loan: LoanRecord) {
    if (settledLoanIds.includes(loan.id)) return

    setSettlingId(loan.id)

    // Find the account id from accounts list
    const account = accounts.find(a => a.name === loan.accountName)
    if (!account) {
      setSettlingId(null)
      return
    }

    const otherCategory = categories.find(c => /^other$/i.test(c.name)) ?? categories[0]

    // Borrowed from someone → settling means you repay → expense
    // Lent to someone → settling means they repay you → income
    const settleType = loan.direction === 'borrowed_from' ? 'expense' : 'income'
    const settleNote = loan.direction === 'borrowed_from'
      ? `Settled: repaid to ${loan.person}`
      : `Settled: received from ${loan.person}`

    await addTransaction({
      amount: loan.amount,
      type: settleType,
      category_id: otherCategory?.id ?? null,
      account_id: account.id,
      date: new Date().toISOString().split('T')[0],
      note: settleNote,
    })

    setSettledLoanIds((prev) => prev.includes(loan.id) ? prev : [...prev, loan.id])
    setSettlingId(null)
  }

    const changeMonth = (dir: 1 | -1) => {
    const next = viewMonth + dir
    if (next > 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else if (next < 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else { setViewMonth(next) }
  }

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const loading = catLoading || budgetsLoading || txLoading
  const error = catError ?? budgetsError ?? txError
  const overallBarColor = summary.percentageUsed >= 100 ? '#E24B4A' : summary.percentageUsed >= 80 ? '#EF9F27' : '#639922'
  const loanDaysInMonth = new Date(Number(loanYear), Number(loanMonth), 0).getDate()
  const MONTH_NUMS = ['01','02','03','04','05','06','07','08','09','10','11','12']

  const pageStyle: CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem 1rem 1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1a1a1a',
  }

  const sectionHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  }

  const iconBtnStyle: CSSProperties = {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '12px',
    padding: '10px 14px',
    cursor: 'pointer',
    color: '#fff',
    lineHeight: 1,
    fontSize: '18px',
    minWidth: '46px',
    minHeight: '46px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
    backgroundColor: '#111',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
  }

  if (loading) {
    return (
      <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '4rem', color: '#888' }}>
        Loading budget…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '4rem', color: '#A32D2D' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={pageStyle}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#fff' }}>
            {MONTHS[viewMonth]} {viewYear}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={iconBtnStyle} onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
          <span style={{ fontSize: '15px', fontWeight: 600, minWidth: '120px', textAlign: 'center', color: '#fff' }}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button style={iconBtnStyle} onClick={() => changeMonth(1)} aria-label="Next month">›</button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
        <MetricCard label="Total budget" value={formatCurrency(summary.totalBudget)} sub="Monthly allocation" />
        <MetricCard label="Total spent" value={formatCurrency(summary.totalSpent)} sub={`${Math.round(summary.percentageUsed)}% used`} />
        <MetricCard
          label="Balance"
          value={formatCurrency(summary.balance)}
          sub={isCurrentMonth ? `${getDaysRemainingInMonth()} days remaining` : '—'}
          valueColor={summary.balance >= 0 ? '#fff' : '#A32D2D'}
          subColor={summary.balance >= 0 ? '#fff' : '#E24B4A'}
        />
        <MetricCard
          label="Budget categories"
          value={String(budgets.length)}
          sub={summary.overBudgetCount > 0 ? `${summary.overBudgetCount} over budget` : 'All within budget'}
          subColor={summary.overBudgetCount > 0 ? '#A32D2D' : '#fff'}
        />
      </div>

      {/* ── Set Your Own Budget ── */}
      <div style={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '18px', padding: '1rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowManualBudget((prev) => !prev)}
          style={{ width: 'auto', borderRadius: '12px', padding: '0.7rem 0.95rem', border: '1px solid rgba(255,255,255,0.14)', backgroundColor: '#111', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Set Your Own Budget
        </button>
        {showManualBudget && (
          <div style={{ display: 'grid', gap: '12px', marginTop: '1rem' }}>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={inputStyle}
            >
              {budgetCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={manualBudget}
              onChange={(e) => setManualBudget(e.target.value)}
              placeholder="Monthly budget amount"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleSaveBudget}
              disabled={isSavingBudget || !selectedCategoryId}
              style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: '#22c55e', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: isSavingBudget || !selectedCategoryId ? 'not-allowed' : 'pointer' }}
            >
              {isSavingBudget ? 'Saving…' : 'Save Budget'}
            </button>
            {saveMessage && (
              <p style={{ color: saveMessageType === 'error' ? '#f87171' : '#9be7ff', fontSize: '13px', margin: 0 }}>
                {saveMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Overall progress bar ── */}
      <div style={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '0.9rem 1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#ccc' }}>Overall Usage</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{Math.round(summary.percentageUsed)}%</span>
        </div>
        <div style={{ height: '10px', backgroundColor: '#222', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(summary.percentageUsed, 100)}%`, backgroundColor: overallBarColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{formatCurrency(summary.totalSpent)}</span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{formatCurrency(summary.totalBudget)}</span>
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: '#fff' }}>Categories</h2>
          <span style={{ fontSize: '13px', color: '#fff' }}>{categories.length} categories</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {categoriesWithStats.map((category) => {
            const hasBudget = category.budgetLimit !== undefined
            const status = getStatus(category.percentage)
            const barColor = status === 'over-budget' ? '#E24B4A' : status === 'near-limit' ? '#EF9F27' : '#639922'
            return (
              <div key={category.id} style={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: category.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {category.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: '#fff' }}>{category.name}</p>
                    <p style={{ fontSize: '12px', color: hasBudget ? '#aaa' : '#555', margin: 0 }}>
                      {hasBudget ? 'Budget set' : 'No budget set'}
                    </p>
                  </div>
                </div>
                {hasBudget && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>Spent: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(category.spent)}</span></span>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>Limit: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(category.budgetLimit!)}</span></span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(category.percentage, 100)}%`, backgroundColor: barColor, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: barColor, fontWeight: 500 }}>{Math.round(category.percentage)}% used</span>
                      <span style={{ fontSize: '11px', color: category.spent <= category.budgetLimit! ? '#639922' : '#E24B4A' }}>
                        {category.spent <= category.budgetLimit!
                          ? `${formatCurrency(category.budgetLimit! - category.spent)} left`
                          : `${formatCurrency(category.spent - category.budgetLimit!)} over`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Loans Section ── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: '#fff' }}>Loans</h2>
            <p style={{ fontSize: '12px', color: '#aaa', margin: '2px 0 0' }}>Track money borrowed or lent</p>
          </div>
          {accounts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLoanForm(true)}
              style={{ borderRadius: '12px', padding: '0.55rem 1.1rem', border: '1px solid rgba(255,255,255,0.14)', backgroundColor: '#1d4ed8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Record Loan
            </button>
          )}
        </div>

        {loanRecords.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#000', borderRadius: '14px', padding: '1rem', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 4px' }}>Total borrowed</p>
              <p style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#4ade80' }}>{formatCurrency(loanSummary.totalBorrowed)}</p>
              <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0' }}>Money coming in</p>
            </div>
            <div style={{ backgroundColor: '#000', borderRadius: '14px', padding: '1rem', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 4px' }}>Total lent</p>
              <p style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#f87171' }}>{formatCurrency(loanSummary.totalLent)}</p>
              <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0' }}>Money going out</p>
            </div>
          </div>
        )}

        {/* Loan records list */}
        {loanRecords.length === 0 ? (
          <div style={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🤝</p>
            <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>No loans recorded yet. Use the button above to track borrowed or lent money.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loanRecords.map(loan => (
              <div key={loan.id} style={{ backgroundColor: '#000', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{loan.direction === 'borrowed_from' ? '🤝' : '💸'}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', margin: 0 }}>
                      {loan.direction === 'borrowed_from' ? `Borrowed from ${loan.person}` : `Lent to ${loan.person}`}
                    </p>
                    <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0' }}>
                      {loan.accountName} · {new Date(loan.date + 'T00:00:00').toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: loan.direction === 'borrowed_from' ? '#4ade80' : '#f87171' }}>
                      {loan.direction === 'borrowed_from' ? '+' : '-'}{formatCurrency(loan.amount)}
                    </p>
                    <p style={{ fontSize: '10px', color: '#3b82f6', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {loan.direction === 'borrowed_from' ? 'borrowed' : 'lent'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettleLoan(loan)}
                    disabled={settlingId === loan.id || settledLoanIds.includes(loan.id)}
                    title="Mark as settled"
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '5px 10px', color: settlingId === loan.id || settledLoanIds.includes(loan.id) ? '#555' : '#aaa', fontSize: '12px', cursor: settlingId === loan.id || settledLoanIds.includes(loan.id) ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {settlingId === loan.id ? '...' : settledLoanIds.includes(loan.id) ? 'Settled' : 'Settle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Loan Modal ── */}
      {showLoanForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.25rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>Record a loan</h2>
                <p style={{ fontSize: '13px', color: '#555', margin: '3px 0 0' }}>Track money you lent or borrowed</p>
              </div>
              <button
                onClick={() => { setShowLoanForm(false); setLoanFormError(null); setLoanFormMessage(null) }}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: 0 }}
              >✕</button>
            </div>

            {/* Direction toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '3px', gap: '3px', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setLoanDirection('borrowed_from')}
                style={{ borderRadius: '9px', padding: '8px 0', border: 'none', backgroundColor: loanDirection === 'borrowed_from' ? '#1d4ed8' : 'transparent', color: loanDirection === 'borrowed_from' ? '#fff' : '#555', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                🤝 Borrowed from
              </button>
              <button
                type="button"
                onClick={() => setLoanDirection('lent_to')}
                style={{ borderRadius: '9px', padding: '8px 0', border: 'none', backgroundColor: loanDirection === 'lent_to' ? '#1d4ed8' : 'transparent', color: loanDirection === 'lent_to' ? '#fff' : '#555', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                💸 Lent to
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#555', marginBottom: '1rem' }}>
              {loanDirection === 'borrowed_from'
                ? 'Someone gave you money — increases your account balance.'
                : 'You gave someone money — decreases your account balance.'}
            </p>

            <form onSubmit={handleAddLoan} style={{ display: 'grid', gap: '12px' }}>

              {/* Person */}
              <div>
                <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                  {loanDirection === 'borrowed_from' ? 'Borrowed from' : 'Lent to'}
                </label>
                <input
                  type="text"
                  value={loanPerson}
                  onChange={e => setLoanPerson(e.target.value)}
                  placeholder="e.g. Ahmad, Mum, XYZ Company"
                  style={inputStyle}
                />
              </div>

              {/* Amount + Account */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={loanAmount}
                    onChange={e => setLoanAmount(e.target.value)}
                    placeholder="100.00"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Account</label>
                  <select value={loanAccountId} onChange={e => setLoanAccountId(e.target.value)} style={inputStyle}>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: '13px', color: '#aaa', display: 'block', marginBottom: '6px' }}>Date</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '8px' }}>
                  <select value={loanDay} onChange={e => setLoanDay(e.target.value)} style={inputStyle}>
                    {Array.from({ length: loanDaysInMonth }, (_, i) => i + 1).map(d => (
                      <option key={d} value={String(d).padStart(2, '0')}>{String(d).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select value={loanMonth} onChange={e => setLoanMonth(e.target.value)} style={inputStyle}>
                    {MONTH_NUMS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                    {loanYear}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => { setShowLoanForm(false); setLoanFormError(null); setLoanFormMessage(null) }}
                  style={{ borderRadius: '20px', padding: '8px 20px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLoan}
                  style={{ borderRadius: '20px', padding: '8px 20px', border: 'none', backgroundColor: '#1d4ed8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: isSubmittingLoan ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmittingLoan ? 'Saving…' : 'Save loan'}
                </button>
              </div>

            </form>

            {loanFormError && <p style={{ color: '#f87171', fontSize: '13px', margin: '10px 0 0' }}>{loanFormError}</p>}
            {loanFormMessage && <p style={{ color: '#4ade80', fontSize: '13px', margin: '10px 0 0' }}>{loanFormMessage}</p>}

          </div>
        </div>
      )}

    </div>
  )
}
