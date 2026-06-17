import { ReactNode } from 'react'

export interface KpiCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: number 
  color?: 'emerald' | 'rose' | 'purple' | 'blue' | 'amber'
  subtitle?: string
  valuePrefix?: string
  valueSuffix?: string
}

const colorMap = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
}

export default function KpiCard({
  title,
  value,
  icon,
  trend,
  color = 'purple',
  subtitle,
  valuePrefix = '',
  valueSuffix = '',
}: KpiCardProps) {
  const colorClass = colorMap[color]

  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value

  return (
    <div className={`p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className={`${colorClass.bg} p-1.5 rounded-lg`}>{icon}</div>}
          <span className="text-xs font-medium text-white/40 uppercase tracking-widest">{title}</span>
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${colorClass.text} tabular-nums`}>
        {valuePrefix}{formattedValue}{valueSuffix}
      </p>
      {subtitle && <p className="text-[11px] text-white/20 mt-1">{subtitle}</p>}
    </div>
  )
}