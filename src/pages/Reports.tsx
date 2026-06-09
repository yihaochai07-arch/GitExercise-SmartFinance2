import { useState, useMemo } from 'react'
import { BarChart3, ArrowUpRight, ArrowDownRight, Wallet, Download } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useWallet } from '../hooks/useWallet'
import { useCategories } from '../hooks/useCategories'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Reports() {
  const { transactions, loading: txLoading, error: txError } = useTransactions()
  const { walletAccounts, totalBalanceMYR, loading: walletLoading, error: walletError } = useWallet() as any
  const { categories } = useCategories()
  
  const [filterAccountId, setFilterAccountId] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  const loading = txLoading || walletLoading
  const error = txError || walletError

  const accountsList = useMemo(() => {
    return Array.isArray(walletAccounts) ? walletAccounts : []
  }, [walletAccounts])

  const primaryCurrency = useMemo(() => {
    if (filterAccountId !== 'all' && accountsList.length > 0) {
      const selectedAcc = accountsList.find(a => a.id === filterAccountId)
      return selectedAcc?.currency ?? 'MYR'
    }
    return 'MYR'
  }, [filterAccountId, accountsList])

  const totalAssets = useMemo(() => {
    if (filterAccountId === 'all') {
      return totalBalanceMYR ?? 0
    }
    
    const selectedAcc = accountsList.find(a => a.id === filterAccountId)
    if (!selectedAcc) return 0
    
    return parseFloat(selectedAcc.balance || selectedAcc.current_balance || selectedAcc.amount || 0)
  }, [filterAccountId, accountsList, totalBalanceMYR])

  const reportData = useMemo(() => {
    if (!transactions.length) return { salary: 0, salesExpenses: 0, totalIncome: 0, categoryBreakdown: {} }

    const now = new Date()
    const cutoffDate = new Date()
    cutoffDate.setMonth(now.getMonth() - 3)

    let salary = 0
    let salesExpenses = 0
    let totalIncome = 0
    const breakdown: Record<string, number> = {}

    transactions.forEach(t => {
      if (filterAccountId !== 'all' && t.account_id !== filterAccountId) return

      const txnDate = new Date(t.date)
      if (txnDate < cutoffDate) return 

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
  }, [transactions, filterAccountId, categories])

  const formatCurrency = (val: number) => {
    const symbol = primaryCurrency === 'MYR' ? 'RM' : primaryCurrency + ' '
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

      pdf.save(`Financial_Report_Rolling3M_${new Date().toISOString().slice(0,10)}.pdf`)
    } catch (err) {
      console.error('PDF export engine error:', err)
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
            <p className="text-sm text-white/30 mt-1 font-light">Rolling 3-month performance overview</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {accountsList.length > 0 && (
              <select
                value={filterAccountId}
                onChange={e => setFilterAccountId(e.target.value)}
                className="bg-[#0a0a0a] border border-white/[0.06] text-white/60 text-sm rounded-xl px-4 py-2 outline-none focus:border-white/[0.12] cursor-pointer transition-all"
              >
                <option value="all">All accounts</option>
                {accountsList.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}

            {!loading && !error && accountsList?.length !== 0 && (
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
              .pdf-print-mode {
                background-color: #ffffff !important;
                color: #000000 !important;
              }
              .pdf-print-mode .rounded-2xl {
                background-color: #fcfcfc !important;
                border-color: #e5e7eb !important;
              }
              .pdf-print-mode p, .pdf-print-mode h3, .pdf-print-mode span {
                color: #111111 !important;
              }
              .pdf-print-mode text-white, .pdf-print-mode .text-white\\/80, .pdf-print-mode .text-white\\/60 {
                color: #1f2937 !important;
              }
              .pdf-print-mode .text-white\\/40, .pdf-print-mode .text-white\\/30, .pdf-print-mode .text-white\\/20 {
                color: #6b7280 !important;
              }
              .pdf-print-mode .bg-white\\/\\[0\\.02\\] {
                background-color: #f3f4f6 !important;
                border-color: #e5e7eb !important;
              }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={14} className="text-purple-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Total Assets</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(totalAssets)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Live balance ({primaryCurrency})</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={14} className="text-emerald-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">3M Total Income</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(reportData.totalIncome)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Recent 3 months income</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight size={14} className="text-rose-400/70" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">3M Expenses</span>
                </div>
                <p className="text-2xl font-bold text-rose-400 tabular-nums">{formatCurrency(reportData.salesExpenses)}</p>
                <span className="text-[11px] text-white/20 mt-1 block">Recent 3 months outflow</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white/80 mb-5">Expense Breakdown (Last 3 Months)</h3>
              {Object.keys(reportData.categoryBreakdown).length === 0 ? (
                <div className="text-center py-10">
                  <BarChart3 size={32} className="mx-auto text-white/10 mb-2" />
                  <p className="text-xs text-white/30">No categorical outflow recorded in the last 3 months</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(reportData.categoryBreakdown).map(([category, amount]) => {
                    const sharePercentage = reportData.salesExpenses > 0 ? (amount / reportData.salesExpenses) * 100 : 0
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/60">{category}</span>
                          <span className="text-white tracking-tight">{formatCurrency(amount)} ({sharePercentage.toFixed(0)}%)</span>
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