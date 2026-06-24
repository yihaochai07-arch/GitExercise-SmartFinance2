export interface MonthlyData {
  monthKey: string 
  displayLabel: string 
  shortLabel: string 
  periodLabel?: string 
  income: number
  expense: number
  net: number
}

interface MonthlyComparisonProps {
  data: MonthlyData[]
  selectedMonthKey?: string | null
  onSelectMonth?: (monthKey: string) => void
  formatCurrency: (amount: number) => string
}

export default function MonthlyComparison({
  data,
  selectedMonthKey,
  onSelectMonth,
  formatCurrency,
}: MonthlyComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        No monthly data available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((month) => {
        const isSelected = selectedMonthKey === month.monthKey
        const netStatus = month.net >= 0 ? 'positive' : 'negative'

        return (
          <button
            key={month.monthKey}
            onClick={() => onSelectMonth?.(month.monthKey)}
            className={`text-left p-5 rounded-2xl border transition-all duration-200 outline-none relative overflow-hidden ${
              isSelected
                ? 'bg-pink-500/[0.03] border-pink-500/40 shadow-lg shadow-pink-500/[0.02]'
                : 'bg-[#0a0a0a] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.01]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                {month.periodLabel && (
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                        : 'text-white/40 bg-white/[0.02] border-white/[0.04]'
                    }`}
                  >
                    {month.periodLabel}
                  </span>
                )}
                <h4 className="text-sm font-semibold text-white/80 mt-1.5">{month.displayLabel}</h4>
              </div>
            </div>

            <div className="space-y-2 pointer-events-none">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Inflow:</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(month.income)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Outflow:</span>
                <span className="text-rose-400 font-medium">{formatCurrency(month.expense)}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04] flex justify-between text-xs font-semibold">
                <span className="text-white/60">Net Balance:</span>
                <span className={netStatus === 'positive' ? 'text-emerald-400' : 'text-rose-400'}>
                  {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}