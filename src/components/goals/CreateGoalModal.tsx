import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Goal } from '../../hooks/useGoals'

type NewGoal = Omit<Goal, 'id' | 'created_at' | 'user_id' | 'current_amount'>

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (goal: NewGoal) => Promise<Goal | null>
}

const CATEGORIES = [
  { key: 'tech', label: 'Tech', emoji: '🚀' },
  { key: 'travel', label: 'Travel', emoji: '✈️' },
  { key: 'housing', label: 'Housing', emoji: '🏠' },
  { key: 'security', label: 'Security', emoji: '🛡️' },
  { key: 'general', label: 'General', emoji: '🎁' },
]

export default function CreateGoalModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit() {
    setError(null)
    const parsedAmount = parseFloat(targetAmount)

    if (!name.trim()) { setError('Please enter a goal title'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Please enter a valid target amount'); return }

    setLoading(true)
    try {
      const result = await onCreate({
        name: name.trim(),
        target_amount: parsedAmount,
        target_date: targetDate || null,
        category,
      })
      if (result) {
        setName('')
        setTargetAmount('')
        setTargetDate('')
        setCategory('general')
        onClose()
      } else {
        setError('Failed to create goal')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-pink-500/40 transition-colors placeholder-white/20'

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Create New Goal</h2>
              <p className="text-xs text-white/30 mt-0.5">Set a target and track your progress</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          {/* Form */}
          <div className="px-6 pb-6 space-y-4">

            {/* Category picker */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                      category === c.key
                        ? 'bg-pink-500/10 border-pink-500/40 text-pink-400'
                        : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/[0.12]'
                    }`}
                  >
                    <span className="text-lg leading-none">{c.emoji}</span>
                    <span className="text-[10px] font-medium">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Trip to Japan"
                className={inputCls}
              />
            </div>

            {/* Target amount */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Target Amount (MYR)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputCls}
              />
            </div>

            {/* Target date */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Target Date <span className="text-white/20">(optional)</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating…</>
                ) : (
                  'Create Goal'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}