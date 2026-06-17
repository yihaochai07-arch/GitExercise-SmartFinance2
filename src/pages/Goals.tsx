import { useState } from 'react'
import { Flag, Plus, Calendar } from 'lucide-react'
import { useGoals } from '../hooks/useGoals'
import CreateGoalModal from '../components/goals/CreateGoalModal'

const CATEGORY_EMOJI: Record<string, string> = {
  tech: '🚀',
  travel: '✈️',
  housing: '🏠',
  security: '🛡️',
  general: '🎁',
}

function monthsUntil(dateStr: string | null): number {
  if (!dateStr) return 0
  const target = new Date(dateStr)
  const now = new Date()
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  return Math.max(1, months)
}

export default function Goals() {
  const { goals, getProgress, addGoal, loading, error } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-pink-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Goals</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Track your savings progress</p>
          </div>
          {goals.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 text-pink-400 text-sm font-medium transition-all duration-200"
            >
              <Plus size={15} />
              Create New Goal
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <Flag size={24} className="text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white/60 mb-2">
              No financial goals yet
            </h2>
            <p className="text-sm text-white/25 font-light mb-8 max-w-xs">
              Create one to start tracking!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 text-pink-400 text-sm font-medium transition-all duration-200"
            >
              <Plus size={15} />
              Create New Goal
            </button>
          </div>
        )}

        {/* Goals grid */}
        {!loading && goals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map(goal => {
              const progress = getProgress(goal.current_amount, goal.target_amount)
              const remaining = Math.max(0, goal.target_amount - goal.current_amount)
              const months = monthsUntil(goal.target_date)
              const monthlyNeeded = remaining / months

              return (
                <div
                  key={goal.id}
                  className="relative flex flex-col gap-4 p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-pink-500/20 transition-all duration-300 overflow-hidden group"
                >
                  {/* Dot grid bg */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Top: emoji + title */}
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-xl shrink-0">
                      {CATEGORY_EMOJI[goal.category] ?? '🎁'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white truncate">{goal.name}</h3>
                      {goal.target_date && (
                        <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                          <Calendar size={11} />
                          {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="relative z-10">
                    <p className="text-2xl font-bold text-white tracking-tight">
                      RM{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      of RM{goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} target
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="relative z-10">
                    <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-white/30 mt-1.5">{progress.toFixed(0)}% complete</p>
                  </div>

                  {/* Smart calculation */}
                  {goal.target_date && remaining > 0 && (
                    <div className="relative z-10 pt-3 border-t border-white/[0.06]">
                      <p className="text-xs text-white/40 leading-relaxed">
                        You need to save{' '}
                        <span className="text-pink-400 font-semibold">
                          RM{monthlyNeeded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                        </span>{' '}
                        to reach this goal.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreateGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addGoal}
      />
    </div>
  )
}