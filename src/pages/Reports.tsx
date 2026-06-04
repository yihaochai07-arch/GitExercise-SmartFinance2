import { useState, useMemo } from 'react'
import { BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Download } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Account {
  id: string;
  name: string;
  balance?: number;
  balanceUSD?: number;
  currency?: string;
}

type TimePeriod = '1m' | '3m' | '6m' | '1y'

export default function Reports() {
  const { transactions, loading: txLoading, error: txError } = useTransactions()
  const { accounts, loading: accLoading, error: accError } = useAccounts()
  const { categories } = useCategories()
  
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3m')
  const [isExporting, setIsExporting] = useState(false) // Handle downloading state spinners

  const loading = txLoading || accLoading
  const error = txError || accError

  const totalAssets = useMemo(() => {
    return (accounts as Account[]).reduce((sum, acc) => {
      return sum + (acc.balanceUSD ?? acc.balance ?? 0)
    }, 0)
  }, [accounts])

  const reportData = useMemo(() => {
    if (!transactions.length) return { salary: 0, salesExpenses: 0, totalIncome: 0, categoryBreakdown: {} }

    const now = new Date()
    let cutoffDate = new Date()

    // Determine the date boundary
    switch (timePeriod) {
      case '1m': cutoffDate.setMonth(now.getMonth() - 1); break
      case '3m': cutoffDate.setMonth(now.getMonth() - 3); break
      case '6m': cutoffDate.setMonth(now.getMonth() - 6); break
      case '1y': cutoffDate.setFullYear(now.getFullYear() - 1); break
    }

    let salary = 0
    let salesExpenses = 0
    let totalIncome = 0
    const breakdown: Record<string, number> = {}

    transactions.forEach(t => {
      const txnDate = new Date(t.date)
      if (txnDate < cutoffDate) return // Skip if out of bounds

      const amount = Number(t.amount) || 0

      if (t.type === 'income') {
        totalIncome += amount
        
        const categoryName = categories.find(c => c.id === t.category_id)?.name?.toLowerCase() ?? ''
        if (categoryName.includes('salary') || categoryName.includes('wage')) {
          salary += amount
        }
      } else if (t.type === 'expense') {
        salesExpenses += amount
        
        const catName = categories.find(c => c.id === t.category_id)?.name ?? 'Other'
        breakdown[catName] = (breakdown[catName] || 0) + amount
      }
    })

    return { salary, salesExpenses, totalIncome, categoryBreakdown: breakdown }
  }, [transactions, timePeriod, categories])

  const exportToPDF = async () => {
    const element = document.getElementById('report-pdf-content')
    if (!element) return

    try {
      setIsExporting(true)

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#050505' 
      })

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

      pdf.save(`Financial_Report_${timePeriod}_${new Date().toISOString().slice(0,10)}.pdf`)
    } catch (err) {
      console.error('PDF export engine error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const formatUSD = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-pink-500/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-purple-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Navigation Dashboard controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Financial Performance</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Monthly and seasonal financial breakdown</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Time Picker Selection Triggers */}
            <div className="flex bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
              {(['1m', '3m', '6m', '1y'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setTimePeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    timePeriod === p
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {p === '1m' && '1 Month'}
                  {p === '3m' && '3 Months'}
                  {p === '6m' && 'Half Year'}
                  {p === '1y' && '1 Year'}
                </button>
              ))}
            </div>

            {/* Secure PDF download trigger button */}
            {!loading && !error && accounts?.length !== 0 && (
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

        {/* Global Loading Frame spinners */}
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

        {/* ===================== Captured Report PDF Element Content Target ===================== */}
        {!loading && !error && (
          <div id="report-pdf-content" className="space-y-6 p-4 rounded-2xl bg-[#050505]">
            
            {/* Top Cards Matrix Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Assets Balance */}
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className="text-purple-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Total Assets</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{formatUSD(totalAssets)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Live balance summary</span>
              </div>

              {/* Card 2: Income Earnings */}
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={14} className="text-emerald-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Salary Income</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatUSD(reportData.salary)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Identified payroll earnings</span>
              </div>

              {/* Card 3: Outflow debits */}
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight size={14} className="text-rose-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Sales & Expenses</span>
                </div>
                <p className="text-2xl font-bold text-rose-400 tabular-nums">{formatUSD(reportData.salesExpenses)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Total debited allocation</span>
              </div>
            </div>

            {/* Distribution Graph Representation section */}
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white/80 mb-5">Expense Breakdown by Category</h3>
              {Object.keys(reportData.categoryBreakdown).length === 0 ? (
                <div className="text-center py-10">
                  <BarChart3 size={32} className="mx-auto text-white/10 mb-2" />
                  <p className="text-xs text-white/30">No categorical outflow recorded for this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(reportData.categoryBreakdown).map(([category, amount]) => {
                    const sharePercentage = reportData.salesExpenses > 0 ? (amount / reportData.salesExpenses) * 100 : 0
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/60">{category}</span>
                          <span className="text-white tracking-tight">{formatUSD(amount)} ({sharePercentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-white/[0.02] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500/60 to-purple-500/60 transition-all duration-300"
                            style={{ width: `${sharePercentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
