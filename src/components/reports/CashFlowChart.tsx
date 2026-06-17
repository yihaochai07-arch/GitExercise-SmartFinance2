import { useMemo } from 'react'

export interface CashFlowData {
  income: number
  expense: number
  net: number
}

interface CashFlowChartProps {
  data: CashFlowData
  formatCurrency: (amount: number) => string
  height?: number
}

export default function CashFlowChart({
  data,
  formatCurrency,
  height = 280,
}: CashFlowChartProps) {
  const { income, expense, net } = data

  const maxValue = useMemo(() => {
    return Math.max(income, expense, Math.abs(net), 1) * 1.15
  }, [income, expense, net])

  const incomeHeight = (income / maxValue) * height * 0.85
  const expenseHeight = (expense / maxValue) * height * 0.85
  const netHeight = (Math.abs(net) / maxValue) * height * 0.85
  const isNetPositive = net >= 0

  return (
    <div className="w-full">
      <div className="flex items-end justify-center gap-12" style={{ height }}>
        {/* Income  */}
        <div className="flex flex-col items-center flex-1">
          <div
            className="w-24 bg-emerald-500/80 rounded-t-lg transition-all duration-500 hover:bg-emerald-500/100 hover:scale-105"
            style={{ height: `${incomeHeight}px`, minHeight: income > 0 ? '8px' : 0 }}
          />
          <span className="text-xs font-medium text-emerald-400/70 mt-3">Income</span>
          <span className="text-sm font-bold text-white">{formatCurrency(income)}</span>
        </div>

        {/* Net */}
        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-24 rounded-t-lg transition-all duration-500 hover:scale-105 ${
              isNetPositive 
                ? 'bg-emerald-500/80 hover:bg-emerald-500/100' 
                : 'bg-rose-500/80 hover:bg-rose-500/100'
            }`}
            style={{ height: `${netHeight}px`, minHeight: net !== 0 ? '8px' : 0 }}
          />
          <span className="text-xs font-medium text-white/40 mt-3">Net</span>
          <span className={`text-sm font-bold ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        </div>

        {/* Expense  */}
        <div className="flex flex-col items-center flex-1">
          <div
            className="w-24 bg-rose-500/80 rounded-t-lg transition-all duration-500 hover:bg-rose-500/100 hover:scale-105"
            style={{ height: `${expenseHeight}px`, minHeight: expense > 0 ? '8px' : 0 }}
          />
          <span className="text-xs font-medium text-rose-400/70 mt-3">Expense</span>
          <span className="text-sm font-bold text-white">{formatCurrency(expense)}</span>
        </div>
      </div>

      <div className="flex justify-center items-center gap-8 mt-6 py-3 bg-white/[0.02] rounded-lg border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/80" />
          <span className="text-xs font-medium text-emerald-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${isNetPositive ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`} />
          <span className={`text-xs font-medium ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            Net ({isNetPositive ? 'Positive' : 'Negative'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-500/80" />
          <span className="text-xs font-medium text-rose-400">Expense</span>
        </div>
      </div>
    </div>
  )
}