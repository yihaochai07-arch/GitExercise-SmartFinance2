import { useState } from 'react'
import { X, Loader2, Coins } from 'lucide-react'
import { Goal } from '../../hooks/useGoals'

interface Props {
  open: boolean
  goal: Goal | null
  onClose: () => void
  onAddSavings: (goalId: string, amount: number) => Promise<boolean>
}

export default function AddSavingsModal({ open, goal, onClose, onAddSavings }: Props) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open || !goal) return null

  async function handleSubmit() {
    setError(null)
    if (!goal) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    const success = await onAddSavings(goal.id, parsed)
    setLoading(false)

    if (success) {
      setAmount('')
      onClose()
    } else {
      setError('Failed to add savings')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Coins size={16} className="text-pink-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Add Savings</h2>
                <p className="text-xs text-white/30 mt-0.5 truncate max-w-[200px]">{goal.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors shrink-0"
            >
              <X size={14} className="text-white/50" />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Current status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-xs text-white/40">Currently saved</span>
              <span className="text-sm font-semibold text-white">
                RM{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Amount to Add (MYR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                  RM
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  autoFocus
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-pink-500/40 transition-colors placeholder-white/20"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

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
                  <><Loader2 size={14} className="animate-spin" /> Saving…</>
                ) : (
                  'Add Savings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}