import { useState } from 'react'
import { Filter, X } from 'lucide-react'

export interface FilterOptions {
  accountId: string | null
  categoryIds: string[]
  type: 'all' | 'income' | 'expense'
  minAmount: number | null
  maxAmount: number | null
  dateRange: { start: Date | null; end: Date | null }
}

interface AdvancedFiltersProps {
  accounts: { id: string; name: string }[]
  categories: { id: string; name: string; icon?: string }[]
  currentFilters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
  onClearFilters: () => void
}

export default function AdvancedFilters({
  accounts,
  categories,
  currentFilters,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
    setIsExpanded(false)
  }

  const handleClear = () => {
    const emptyFilters: FilterOptions = {
      accountId: null,
      categoryIds: [],
      type: 'all',
      minAmount: null,
      maxAmount: null,
      dateRange: { start: null, end: null },
    }
    setLocalFilters(emptyFilters)
    onClearFilters()
    setIsExpanded(false)
  }

  const filterCount = Object.values(localFilters).filter((v) => {
    if (Array.isArray(v)) return v.length > 0
    if (v && typeof v === 'object') return v.start !== null || v.end !== null
    return v !== null && v !== 'all'
  }).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] text-white/60 hover:text-white/80 text-sm transition-all"
      >
        <Filter size={16} />
        <span>Filters</span>
        {filterCount > 0 && (
          <span className="bg-pink-500/20 text-pink-400 text-xs px-2 py-0.5 rounded-full">
            {filterCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-[420px] max-w-[90vw] bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-5 shadow-2xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold text-white">Advanced Filters</h4>
            <button onClick={() => setIsExpanded(false)} className="text-white/40 hover:text-white/60">
              <X size={18} />
            </button>
          </div>

          {/* Account filter */}
          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Account</label>
            <select
              value={localFilters.accountId || ''}
              onChange={(e) => handleChange('accountId', e.target.value || null)}
              className="w-full bg-[#111] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-white/[0.12]"
            >
              <option value="">All accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = localFilters.categoryIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      const newIds = isSelected
                        ? localFilters.categoryIds.filter((id) => id !== cat.id)
                        : [...localFilters.categoryIds, cat.id]
                      handleChange('categoryIds', newIds)
                    }}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Type</label>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleChange('type', type)}
                  className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${
                    localFilters.type === type
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/[0.02] text-white/40 border border-transparent hover:border-white/10'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>


          <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.04]">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition"
            >
              Clear all
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-pink-500/20 border border-pink-500/30 text-pink-400 rounded-lg text-sm font-medium hover:bg-pink-500/30 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}