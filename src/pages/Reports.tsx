import { useState, useMemo } from 'react'
import { BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Download, Calendar } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useWallet } from '../hooks/useWallet'
import { useCategories } from '../hooks/useCategories'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Reports() {
  const { transactions, loading: txLoading, error: txError } = useTransactions()
  const { totalBalanceMYR, groups, loading: walletLoading, error: walletError } = useWallet() as any
  const { categories } = useCategories()
  
  const [filterAccountId, setFilterAccountId] = useState<string>('all')
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all') 
  const [isExporting, setIsExporting] = useState(false)

  const loading = txLoading || walletLoading
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

      const txnDate = new Date(t.date)
      const txnMonthKey = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`
      const amount = Number(t.amount) || 0

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
  }, [transactions, filterAccountId, categories, monthLabels, selectedMonthKey])

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-pink-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-purple-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Financial Performance</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Comparative analysis for the last 3 months</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {detailedAccountsList.length > 0 && (
              <select
                value={filterAccountId}
                onChange={e => setFilterAccountId(e.target.value)}
                className="bg-[#0a0a0a] border border-white/[0.06] text-white/60 text-sm rounded-xl px-4 py-2 outline-none focus:border-white/[0.12] cursor-pointer transition-all"
              >
                <option value="all">All accounts</option>
                {detailedAccountsList.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}

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

        {!loading && !error && (
          <div id="report-pdf-content" className="space-y-6 p-4 rounded-2xl bg-[#050505]">
            
            <style>{`
              .pdf-assignment-table { display: none; }
              .pdf-print-mode { background-color: #ffffff !important; color: #000000 !important; padding: 30px !important; }
              .pdf-print-mode .dashboard-cards-view,
              .pdf-print-mode .dashboard-monthly-breakdown,
              .pdf-print-mode .dashboard-category-view { display: none !important; }
              .pdf-print-mode .pdf-assignment-table { display: block !important; color: #000000 !important; font-family: Arial, sans-serif; }
            `}</style>

            <div className="dashboard-cards-view grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className="text-purple-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Total Assets</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{formatSpecificCurrency(totalAssets, 'MYR')}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Live balance (MYR)</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={14} className="text-emerald-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                    {selectedMonthKey === 'all' ? '3M Total Income' : 'Selected Month Income'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(reportData.uiIncome)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">
                  {selectedMonthKey === 'all' ? 'Accumulated inflow' : 'Filtered context'}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight size={14} className="text-rose-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                    {selectedMonthKey === 'all' ? '3M Expenses' : 'Selected Month Expenses'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-rose-400 tabular-nums">{formatCurrency(reportData.uiExpense)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">
                  {selectedMonthKey === 'all' ? 'Accumulated outflow' : 'Filtered context'}
                </span>
              </div>
            </div>

            <div className="dashboard-monthly-breakdown space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Filter by Statement Period</span>
                {selectedMonthKey !== 'all' && (
                  <button 
                    onClick={() => setSelectedMonthKey('all')}
                    className="text-[11px] text-pink-400 hover:underline bg-pink-500/5 px-2 py-0.5 rounded border border-pink-500/10"
                  >
                    Clear Filter (Show All 3M)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthLabels.map((m) => {
                  const data = reportData.monthlyStats[m.monthKey] || { income: 0, expense: 0 }
                  const netStatus = data.income - data.expense
                  const isSelected = selectedMonthKey === m.monthKey

                  return (
                    <button
                      key={m.monthKey}
                      onClick={() => setSelectedMonthKey(m.monthKey)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 outline-none relative overflow-hidden ${
                        isSelected 
                          ? 'bg-pink-500/[0.03] border-pink-500/40 shadow-lg shadow-pink-500/[0.02]' 
                          : 'bg-[#0a0a0a] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.01]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                            isSelected 
                              ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' 
                              : 'text-white/40 bg-white/[0.02] border-white/[0.04]'
                          }`}>
                            {m.periodLabel}
                          </span>
                          <h4 className="text-sm font-semibold text-white/80 mt-1.5">{m.displayLabel}</h4>
                        </div>
                        <Calendar size={16} className={isSelected ? 'text-pink-400/40' : 'text-white/10'} />
                      </div>

                      <div className="space-y-2 pointer-events-none">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Inflow:</span>
                          <span className="text-emerald-400 font-medium">{formatCurrency(data.income)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Outflow:</span>
                          <span className="text-rose-400 font-medium">{formatCurrency(data.expense)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/[0.04] flex justify-between text-xs font-semibold">
                          <span className="text-white/60">Net Balance:</span>
                          <span className={netStatus >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {netStatus >= 0 ? '+' : ''}{formatCurrency(netStatus)}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="dashboard-category-view p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-semibold text-white/80">Expense Breakdown by Category</h3>
                <span className="text-[11px] font-mono text-white/20">
                  {selectedMonthKey === 'all' ? 'Context: Full 3 Months' : `Context: Only ${monthLabels.find(m => m.monthKey === selectedMonthKey)?.shortLabel}`}
                </span>
              </div>

              {Object.keys(reportData.uiCategoryBreakdown).length === 0 ? (
                <div className="text-center py-10">
                  <BarChart3 size={32} className="mx-auto text-white/10 mb-2" />
                  <p className="text-xs text-white/30">No categorical outflows recorded for this selected context</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(reportData.uiCategoryBreakdown).map(([category, amount]) => {
                    const sharePercentage = reportData.uiExpense > 0 ? (amount / reportData.uiExpense) * 100 : 0
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/60">{category}</span>
                          <span className="text-white tracking-tight">{formatCurrency(amount)} ({sharePercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-white/[0.02] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500/60 to-purple-500/60"
                            style={{ width: `${sharePercentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

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