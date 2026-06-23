import { useMemo } from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface PieData {
  name: string
  value: number
  color: string
  percentage: number
}

interface PieChartProps {
  data: PieData[]
  formatCurrency: (amount: number) => string
  height?: number
}

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

const FALLBACK_COLORS = [ '#f59e0b', '#6b7280', '#ec4899','#3b82f6','#94a3b8','#8b5cf6','#f97316', '#14b8a6']

const getColorForCategory = (name: string, index: number): string => {
  if (CATEGORY_COLORS[name]) return CATEGORY_COLORS[name]
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}


const renderCustomLabel = (entry: any) => {
  const { cx, cy, midAngle, outerRadius, percent } = entry
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 18 
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  const percentText = `${(percent * 100).toFixed(0)}%` 

 
  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
      stroke="#000000"
      strokeWidth={0.5}
    >
      {percentText}
    </text>
  )
}

const CustomTooltip = ({ active, payload, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-lg p-3 shadow-xl">
      <p className="text-white/80 text-sm font-semibold">{data.name}</p>
      <p className="text-white text-sm">{formatCurrency(data.value)}</p>
      <p className="text-white/40 text-xs">{data.percentage.toFixed(1)}%</p>
    </div>
  )
}

export default function PieChart({ data, formatCurrency, height = 320 }: PieChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || getColorForCategory(item.name, index),
    }))
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-white/30 text-sm">
        No expense data
      </div>
    )
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={90}         
            label={renderCustomLabel} 
            labelLine={{ stroke: '#ffffff44', strokeWidth: 1 }} 
            stroke="#0a0a0a"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={(props) => <CustomTooltip {...props} formatCurrency={formatCurrency} />} />
          <Legend
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value, entry: any) => {
              const { payload } = entry
              if (!payload) return value
              return (
                <span style={{ color: '#ffffffcc', fontSize: '12px' }}>
                  {value} ({payload.percentage.toFixed(0)}%)
                </span>
              )
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="text-center mt-1">
        <span className="text-xs text-white/30">Total: {formatCurrency(total)}</span>
      </div>
    </div>
  )
}