import { useMemo, useState, useEffect, type CSSProperties } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useBudgets, type Budget } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

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

  const { categories, loading: catLoading, error: catError } = useCategories()
  const { budgets, loading: budgetsLoading, error: budgetsError, saveBudget } = useBudgets()
  const { transactions, loading: txLoading, error: txError } = useTransactions()

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
      return {
        ...category,
        budgetLimit: budget?.limit,
        spent,
        percentage,
      }
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

  // FIX 1: changeMonth no longer skips years
  const changeMonth = (dir: 1 | -1) => {
    const next = viewMonth + dir
    if (next > 11) {
      setViewMonth(0)
      setViewYear((year) => year + 1)
    } else if (next < 0) {
      setViewMonth(11)
      setViewYear((year) => year - 1)
    } else {
      setViewMonth(next)
    }
  }

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const loading = catLoading || budgetsLoading || txLoading
  const error = catError ?? budgetsError ?? txError

  const overallBarColor =
    summary.percentageUsed >= 100 ? '#E24B4A' :
    summary.percentageUsed >= 80 ? '#EF9F27' :
    '#639922'

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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '1.25rem',
      }}>
        <MetricCard
          label="Total budget"
          value={formatCurrency(summary.totalBudget)}
          sub="Monthly allocation"
        />
        <MetricCard
          label="Total spent"
          value={formatCurrency(summary.totalSpent)}
          sub={`${Math.round(summary.percentageUsed)}% used`}
        />
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

      <div style={{
        backgroundColor: '#000',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '18px',
        padding: '1rem',
        marginBottom: '1rem',
      }}>
        <button
          type="button"
          onClick={() => setShowManualBudget((prev) => !prev)}
          style={{
            width: 'auto',
            borderRadius: '12px',
            padding: '0.7rem 0.95rem',
            border: '1px solid rgba(255,255,255,0.14)',
            backgroundColor: '#111',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Set Your Own Budget
        </button>
        {showManualBudget ? (
          <div style={{ display: 'grid', gap: '12px', marginTop: '1rem' }}>
            <select
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '14px',
              }}
            >
              {budgetCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={manualBudget}
              onChange={(event) => setManualBudget(event.target.value)}
              placeholder="Monthly budget amount"
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <button
              type="button"
              onClick={handleSaveBudget}
              disabled={isSavingBudget || !selectedCategoryId}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#22c55e',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSavingBudget || !selectedCategoryId ? 'not-allowed' : 'pointer',
              }}
            >
              {isSavingBudget ? 'Saving…' : 'Save Budget'}
            </button>
            {saveMessage ? (
              <p style={{ color: saveMessageType === 'error' ? '#f87171' : '#9be7ff', fontSize: '13px', margin: 0 }}>
                {saveMessage}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={{
        backgroundColor: '#000',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '0.9rem 1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#ccc' }}>Overall Usage</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{Math.round(summary.percentageUsed)}%</span>
        </div>
        <div style={{ height: '10px', backgroundColor: '#222', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(summary.percentageUsed, 100)}%`,
            backgroundColor: overallBarColor,
            borderRadius: '99px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{formatCurrency(summary.totalSpent)}</span>
          <span style={{ fontSize: '11px', color: '#aaa' }}>{formatCurrency(summary.totalBudget)}</span>
        </div>
      </div>

      {/* FIX 2: Categories now show budget amount, spent, progress bar and percentage */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: '#fff' }}>Categories</h2>
          <span style={{ fontSize: '13px', color: '#fff' }}>{categories.length} categories</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {categoriesWithStats.map((category) => {
            const hasBudget = category.budgetLimit !== undefined
            const status = getStatus(category.percentage)
            const barColor =
              status === 'over-budget' ? '#E24B4A' :
              status === 'near-limit' ? '#EF9F27' :
              '#639922'

            return (
              <div key={category.id} style={{
                backgroundColor: '#000',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem',
              }}>
                {/* Category header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: category.color + '22',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {category.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: '#fff' }}>{category.name}</p>
                    <p style={{ fontSize: '12px', color: hasBudget ? '#aaa' : '#555', margin: 0 }}>
                      {hasBudget ? 'Budget set' : 'No budget set'}
                    </p>
                  </div>
                </div>

                {/* Budget details — only shown when a budget exists */}
                {hasBudget && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>
                        Spent: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(category.spent)}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>
                        Limit: <span style={{ color: '#fff', fontWeight: 500 }}>{formatCurrency(category.budgetLimit!)}</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#222', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(category.percentage, 100)}%`,
                        backgroundColor: barColor,
                        borderRadius: '99px',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: barColor, fontWeight: 500 }}>
                        {Math.round(category.percentage)}% used
                      </span>
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
    </div>
  )
}
