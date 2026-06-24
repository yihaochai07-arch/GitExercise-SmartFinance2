import { useState, useMemo } from 'react'
import { Wallet, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useWallet } from '../hooks/useWallet'
import { useCategories } from '../hooks/useCategories'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import {
  KpiCard,
  MonthlyComparison,
  AdvancedFilters,
  CategoryTree,
  CashFlowChart,
  PieChart,  
} from '../components/reports'
import type { MonthlyData, CategoryNode } from '../components/reports'

export default function Reports() {
  const { transactions, loading: txLoading, error: txError } = useTransactions()
  const { totalBalanceMYR, groups, loading: walletLoading, error: walletError } = useWallet() as any
  const { categories, loading: categoriesLoading } = useCategories()
  
  const [filterAccountId, setFilterAccountId] = useState<string>('all')
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([])
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterMinAmount, setFilterMinAmount] = useState<number | null>(null)
  const [filterMaxAmount, setFilterMaxAmount] = useState<number | null>(null)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all') 
  const [isExporting, setIsExporting] = useState(false)

  const loading = txLoading || walletLoading || categoriesLoading
  const error = txError || walletError

  const monthLabels = useMemo(() => {
    return [
      { monthKey: '2026-06', displayLabel: 'June 2026', shortLabel: 'June', periodLabel: 'This Month' },
      { monthKey: '2026-05', displayLabel: 'May 2026', shortLabel: 'May', periodLabel: 'Last Month' },
      { monthKey: '2026-04', displayLabel: 'April 2026', shortLabel: 'April', periodLabel: 'Month Before Last' }
    ]
  }, [])

  const detailedAccountsList = useMemo(() => {
    if (!groups || !Array.isArray(groups)) return []
    const flatList: any[] = []
    groups.forEach((g: any) => {
      if (g.accounts && Array.isArray(g.accounts)) {
        g.accounts.forEach((acc: any) => {
          flatList.push({
            id: acc.id,
            name: acc.provider?.name || acc.name || 'Unknown Account',
            currency: acc.currency || g.currency || 'MYR',
            displayBalance: acc.displayBalance || `${acc.currency || 'MYR'} 0.00`
          })
        })
      }
    })
    return flatList
  }, [groups])

  const primaryCurrency = useMemo(() => {
    if (filterAccountId !== 'all' && detailedAccountsList.length > 0) {
      const selectedAcc = detailedAccountsList.find(a => a.id === filterAccountId)
      return selectedAcc?.currency ?? 'MYR'
    }
    return 'MYR'
  }, [filterAccountId, detailedAccountsList])

  const totalAssets = useMemo(() => {
    return totalBalanceMYR ?? 0
  }, [totalBalanceMYR])

  const reportData = useMemo(() => {
    const defaultMonthData = () => ({ income: 0, expense: 0 })
    
    const monthlyStats: Record<string, { income: number; expense: number }> = {
      '2026-06': defaultMonthData(),
      '2026-05': defaultMonthData(),
      '2026-04': defaultMonthData(),
    }

    let fullIncome3M = 0
    let fullExpense3M = 0
    const fullCategoryBreakdown: Record<string, number> = {}
    const fullIncomeBreakdown: Record<string, number> = {}

    let uiIncome = 0
    let uiExpense = 0
    const uiCategoryBreakdown: Record<string, number> = {}

    monthLabels.forEach(m => {
      fullIncomeBreakdown[m.shortLabel] = 0
    })

    const targetMonths = monthLabels.map(m => m.monthKey)

    transactions.forEach(t => {
      if (filterAccountId !== 'all' && t.account_id !== filterAccountId) return

      if (filterType === 'income' && t.type !== 'income') return
      if (filterType === 'expense' && t.type !== 'expense') return

      const amount = Number(t.amount) || 0
      if (filterMinAmount !== null && amount < filterMinAmount) return
      if (filterMaxAmount !== null && amount > filterMaxAmount) return

      if (filterCategoryIds.length > 0 && !filterCategoryIds.includes(t.category_id)) return

      const txnDate = new Date(t.date)
      const txnMonthKey = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`

      if (targetMonths.includes(txnMonthKey)) {
        const currentMonthLabel = monthLabels.find(m => m.monthKey === txnMonthKey)?.shortLabel || 'Other'
        
        if (monthlyStats[txnMonthKey]) {
          if (t.type === 'income') monthlyStats[txnMonthKey].income += amount
          if (t.type === 'expense') monthlyStats[txnMonthKey].expense += amount
        }

        if (t.type === 'income') {
          fullIncome3M += amount
          fullIncomeBreakdown[currentMonthLabel] += amount
        } else if (t.type === 'expense') {
          fullExpense3M += amount
          const catName = categories.find(c => c.id === t.category_id)?.name ?? 'Other'
          fullCategoryBreakdown[catName] = (fullCategoryBreakdown[catName] || 0) + amount
        }

        const isMatchesTab = selectedMonthKey === 'all' || selectedMonthKey === txnMonthKey
        if (isMatchesTab) {
          if (t.type === 'income') {
            uiIncome += amount
          } else if (t.type === 'expense') {
            uiExpense += amount
            const catName = categories.find(c => c.id === t.category_id)?.name ?? 'Other'
            uiCategoryBreakdown[catName] = (uiCategoryBreakdown[catName] || 0) + amount
          }
        }
      }
    })

    return { 
      monthlyStats, 
      uiIncome,
      uiExpense,
      uiCategoryBreakdown,
      fullIncome3M, 
      fullExpense3M, 
      fullCategoryBreakdown,
      fullIncomeBreakdown
    }
  }, [transactions, filterAccountId, filterCategoryIds, filterType, filterMinAmount, filterMaxAmount, categories, monthLabels, selectedMonthKey])

  const formatCurrency = (val: number) => {
    const symbol = primaryCurrency === 'MYR' ? 'RM' : primaryCurrency + ' '
    const formattedNum = new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val)
    return `${symbol}${formattedNum}`
  }

  const formatSpecificCurrency = (val: number, currencyCode: string) => {
    const symbol = currencyCode === 'MYR' ? 'RM' : currencyCode + ' '
    const formattedNum = new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(val)
    return `${symbol}${formattedNum}`
  }


  //  MonthlyComparison 
  const monthlyComparisonData = useMemo<MonthlyData[]>(() => {
    return monthLabels.map((m) => {
      const data = reportData.monthlyStats[m.monthKey] || { income: 0, expense: 0 }
      return {
        monthKey: m.monthKey,
        displayLabel: m.displayLabel,
        shortLabel: m.shortLabel,
        periodLabel: m.periodLabel,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }
    })
  }, [monthLabels, reportData])

  //  CategoryTree 
  const categoryTreeData = useMemo<CategoryNode[]>(() => {
    return Object.entries(reportData.uiCategoryBreakdown).map(([name, amount]) => {
      const percentage = reportData.uiExpense > 0 ? (amount / reportData.uiExpense) * 100 : 0
      const category = categories.find(c => c.name === name)
      return {
        id: category?.id || name,
        name,
        icon: category?.icon || '📂',
        color: category?.color || '#888',
        amount,
        percentage,
        children: [],
      }
    })
  }, [reportData.uiCategoryBreakdown, reportData.uiExpense, categories])

  // CashFlowChart 
  const totalCashFlow = useMemo(() => {
    if (selectedMonthKey !== 'all') {
      const data = reportData.monthlyStats[selectedMonthKey] || { income: 0, expense: 0 }
      return {
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }
    }
    
    const totalIncome = monthLabels.reduce((sum, m) => {
      return sum + (reportData.monthlyStats[m.monthKey]?.income || 0)
    }, 0)
    const totalExpense = monthLabels.reduce((sum, m) => {
      return sum + (reportData.monthlyStats[m.monthKey]?.expense || 0)
    }, 0)
    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    }
  }, [monthLabels, reportData, selectedMonthKey])

 // PieChart
const pieData = useMemo(() => {
  const CATEGORY_COLORS: Record<string, string> = {
    'Food & Dining': '#f59e0b',  
    'Utilities': '#6b7280',        
    'Shopping': '#ec4899',        
    'Transport': '#3b82f6',        
    'Other': '#94a3b8',            
    'Entertainment': '#8b5cf6',    
    'Investments': '#f97316',      
    'Health': '#14b8a6',          
  }

  const entries = Object.entries(reportData.uiCategoryBreakdown)
    .map(([name, amount]) => ({
      name,
      value: amount,
      color: CATEGORY_COLORS[name] || '#6b7280',
      percentage: reportData.uiExpense > 0 ? (amount / reportData.uiExpense) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)

  if (entries.length > 8) {
    const main = entries.slice(0, 7)
    const others = entries.slice(7)
    const othersTotal = others.reduce((sum, item) => sum + item.value, 0)
    if (othersTotal > 0) {
      main.push({
        name: 'Others',
        value: othersTotal,
        color: '#94a3b8',
        percentage: reportData.uiExpense > 0 ? (othersTotal / reportData.uiExpense) * 100 : 0,
      })
    }
    return main
  }

  return entries
}, [reportData.uiCategoryBreakdown, reportData.uiExpense])

  const exportToPDF = async () => {
    const element = document.getElementById('report-pdf-content')
    if (!element) return

    try {
      setIsExporting(true)
      element.classList.add('pdf-print-mode')

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      element.classList.remove('pdf-print-mode')

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Financial_Report_3Months_${new Date().toISOString().slice(0,10)}.pdf`)
    } catch (err) {
      console.error(err)
      element.classList.remove('pdf-print-mode')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      {/*BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-pink-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-purple-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEAD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Financial Performance</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Comparative analysis for the last 3 months</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            {/* AdvancedFilters*/}
            <AdvancedFilters
              accounts={detailedAccountsList.map(a => ({ id: a.id, name: a.name }))}
              categories={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
              currentFilters={{
                accountId: filterAccountId === 'all' ? null : filterAccountId,
                categoryIds: filterCategoryIds,
                type: filterType,
                minAmount: filterMinAmount,
                maxAmount: filterMaxAmount,
                dateRange: { start: null, end: null },
              }}
              onApplyFilters={(filters) => {
                setFilterAccountId(filters.accountId || 'all')
                setFilterCategoryIds(filters.categoryIds)
                setFilterType(filters.type)
                setFilterMinAmount(filters.minAmount)
                setFilterMaxAmount(filters.maxAmount)
              }}
              onClearFilters={() => {
                setFilterAccountId('all')
                setFilterCategoryIds([])
                setFilterType('all')
                setFilterMinAmount(null)
                setFilterMaxAmount(null)
              }}
            />

            {/*DOWNLOAD PDF */}
            {!loading && !error && detailedAccountsList?.length !== 0 && (
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 text-pink-400 text-xs font-medium transition-all duration-200 disabled:opacity-50"
              >
                <Download size={14} />
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="p-4 mb-6 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* MAIN */}
        {!loading && !error && (
          <div id="report-pdf-content" className="space-y-6 p-4 rounded-2xl bg-[#050505]">
            
            <style>{`
              .pdf-assignment-table { display: none; }
              .pdf-print-mode { background-color: #ffffff !important; color: #000000 !important; padding: 30px !important; }
              .pdf-print-mode .dashboard-cards-view,
              .pdf-print-mode .dashboard-monthly-breakdown,
              .pdf-print-mode .dashboard-category-view,
              .pdf-print-mode .dashboard-cashflow-view { display: none !important; }
              .pdf-print-mode .pdf-assignment-table { display: block !important; color: #000000 !important; font-family: Arial, sans-serif; }
            `}</style>

            {/* KPI CARD */}
            <div className="dashboard-cards-view grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                title="Total Assets"
                value={totalAssets}
                icon={<Wallet size={18} className="text-purple-400/70" />}
                color="purple"
                subtitle="Live balance (MYR)"
                valuePrefix="RM "
              />

              <KpiCard
                title={selectedMonthKey === 'all' ? '3M Total Income' : 'Selected Month Income'}
                value={reportData.uiIncome}
                icon={<ArrowUpRight size={18} className="text-emerald-400/70" />}
                color="emerald"
                subtitle={selectedMonthKey === 'all' ? 'Accumulated inflow' : 'Filtered context'}
                valuePrefix="RM "
              />

              <KpiCard
                title={selectedMonthKey === 'all' ? '3M Expenses' : 'Selected Month Expenses'}
                value={reportData.uiExpense}
                icon={<ArrowDownRight size={18} className="text-rose-400/70" />}
                color="rose"
                subtitle={selectedMonthKey === 'all' ? 'Accumulated outflow' : 'Filtered context'}
                valuePrefix="RM "
              />
            </div>

            {/* MONTHY COMPARARISON */}
            <div className="dashboard-monthly-breakdown space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-medium text-white/30 uppercase tracking-wider">
                  Filter by Statement Period
                </span>
                {selectedMonthKey !== 'all' && (
                  <button 
                    onClick={() => setSelectedMonthKey('all')}
                    className="text-[11px] text-pink-400 hover:underline bg-pink-500/5 px-2 py-0.5 rounded border border-pink-500/10"
                  >
                    Clear Filter (Show All 3M)
                  </button>
                )}
              </div>

              <MonthlyComparison
                data={monthlyComparisonData}
                selectedMonthKey={selectedMonthKey}
                onSelectMonth={setSelectedMonthKey}
                formatCurrency={formatCurrency}
              />
            </div>

            {/*CASHFLOW*/}
            <div className="dashboard-cashflow-view p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white/80">Cash Flow</h3>
                <span className="text-[11px] font-mono text-white/20">
                  {selectedMonthKey !== 'all' 
                    ? `Month: ${monthLabels.find(m => m.monthKey === selectedMonthKey)?.displayLabel}` 
                    : '3-Month Total'}
                  {filterCategoryIds.length > 0 && ` | Category: ${filterCategoryIds.map(id => categories.find(c => c.id === id)?.name).join(', ')}`}
                </span>
              </div>
              <CashFlowChart
                data={totalCashFlow}
                formatCurrency={formatCurrency}
                height={280}
              />
            </div>

            {/* CATEGORY + PIE CHART */}
            <div className="dashboard-category-view p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-semibold text-white/80">Expense Breakdown by Category</h3>
                <span className="text-[11px] font-mono text-white/20">
                  {selectedMonthKey === 'all' 
                    ? 'Context: Full 3 Months' 
                    : `Context: Only ${monthLabels.find(m => m.monthKey === selectedMonthKey)?.shortLabel}`}
                </span>
              </div>

              {categoryTreeData.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-white/30 text-sm">No categorical outflows recorded</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className="flex items-center justify-center">
                    {pieData.length > 0 ? (
                      <PieChart 
                        data={pieData} 
                        formatCurrency={formatCurrency} 
                        height={300}
                      />
                    ) : (
                      <div className="text-white/30 text-sm">No data</div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <CategoryTree
                      data={categoryTreeData}
                      formatCurrency={formatCurrency}
                      maxDepth={1}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PDF */}
            <div className="pdf-assignment-table w-full max-w-2xl mx-auto hidden">
              <div className="pb-3 text-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-wider text-black">STATEMENT OF FINANCIAL PERFORMANCE</h2>
                <p className="text-xs text-black mt-1 font-sans">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
                <div className="border-b border-black mt-3" />
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black">ASSETS</h3>
                <div className="space-y-1 pl-1">
                  {filterAccountId === 'all' ? (
                    detailedAccountsList.map(a => (
                      <div key={a.id} className="flex justify-between text-xs font-mono text-black">
                        <span>{a.name}</span>
                        <span>{a.displayBalance}</span>
                      </div>
                    ))
                  ) : (
                    (() => {
                      const selected = detailedAccountsList.find(a => a.id === filterAccountId);
                      if (!selected) return null;
                      return (
                        <div className="flex justify-between text-xs font-mono text-black">
                          <span>{selected.name}</span>
                          <span>{selected.displayBalance}</span>
                        </div>
                      );
                    })()
                  )}
                  <div className="flex justify-between text-xs font-bold border-t border-black pt-1 mt-1 font-mono text-black">
                    <span>TOTAL ASSETS (MYR Valuation)</span>
                    <span className="underline decoration-double">{formatSpecificCurrency(totalAssets, 'MYR')}</span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black">LESS: EXPENSES (ROLLING 3M)</h3>
                <div className="space-y-1 pl-1">
                  {Object.keys(reportData.fullCategoryBreakdown).length === 0 ? (
                    <div className="text-xs text-black italic pl-1">No data available</div>
                  ) : (
                    Object.entries(reportData.fullCategoryBreakdown).map(([category, amount]) => (
                      <div key={category} className="flex justify-between text-xs font-mono text-black">
                        <span>{category}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between text-xs font-bold border-t border-black pt-1 mt-1 font-mono text-black">
                    <span>TOTAL EXPENSES</span>
                    <span>({formatCurrency(reportData.fullExpense3M)})</span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2 text-black">INCOME</h3>
                <div className="space-y-1 pl-1 mb-2">
                  {monthLabels.slice().reverse().map(m => {
                    const monthIncome = reportData.fullIncomeBreakdown[m.shortLabel] || 0
                    return (
                      <div key={m.monthKey} className="flex justify-between text-xs font-mono text-black pl-3 italic">
                        <span>— {m.shortLabel} Earnings</span>
                        <span>{formatCurrency(monthIncome)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="space-y-1 pl-1">
                  <div className="flex justify-between text-xs font-mono text-black border-t border-gray-300 pt-1">
                    <span>3M Total Inflow / Earnings</span>
                    <span>{formatCurrency(reportData.fullIncome3M)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t-2 border-b-2 border-black py-2 px-1">
                <div className="flex justify-between text-sm font-bold font-mono text-black">
                  <span>NET BALANCED POSITION</span>
                  <span className="underline decoration-double">
                    {formatCurrency(reportData.fullIncome3M - reportData.fullExpense3M)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}