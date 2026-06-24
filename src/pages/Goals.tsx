import { useState, useMemo } from 'react'
import { Flag, Plus, Calendar, Trash2, CheckCircle2, Coins } from 'lucide-react'
import { useGoals, Goal } from '../hooks/useGoals'
import CreateGoalModal from '../components/goals/CreateGoalModal'
import AddSavingsModal from '../components/goals/AddSavingsModal'

const CATEGORY_EMOJI: Record<string, string> = {
  tech: '🚀',
  travel: '✈️',
  housing: '🏠',
  security: '🛡️',
  general: '🎁',
}

function monthsUntil(dateStr: string | null): number {
  if (!dateStr) return 1
  const target = new Date(dateStr)
  const now = new Date()
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  return Math.max(1, months)
}

// ── Circular progress ring component ─────────────────────────────
function ProgressRing({ progress, completed }: { progress: number; completed: boolean }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius} fill="none"
          stroke={completed ? '#34d399' : 'url(#ringGradient)'}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${completed ? 'text-emerald-400' : 'text-white'}`}>
          {progress.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

// ── Single goal card ───────────────────────────────────────────────
function GoalCard({
  goal, completed, onAddSavings, onDelete,
}: {
  goal: Goal
  completed: boolean
  onAddSavings: (g: Goal) => void
  onDelete: (id: string) => void
}) {
  const progress = goal.target_amount === 0 ? 0 : Math.min(100, (goal.current_amount / goal.target_amount) * 100)
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const months = monthsUntil(goal.target_date)
  const monthlyNeeded = remaining / months

  return (
    <div className={`relative flex flex-col sm:flex-row items-stretch gap-5 p-6 rounded-2xl border transition-all duration-300 overflow-hidden group ${
      completed
        ? 'bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/40'
        : 'bg-[#0a0a0a] border-white/[0.06] hover:border-pink-500/20'
    }`}>
      {/* Dot grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Left: ring + emoji */}
      <div className="relative z-10 flex items-center gap-4 shrink-0">
        <ProgressRing progress={progress} completed={completed} />
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
          completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-pink-500/10 border-pink-500/20'
        }`}>
          {CATEGORY_EMOJI[goal.category] ?? '🎁'}
        </div>
      </div>

      {/* Middle: info */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col gap-2 justify-center">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-white truncate">{goal.name}</h3>
          {completed && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> Goal reached!
            </span>
          )}
          {goal.target_date && (
            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <Calendar size={10} />
              {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        <p className="text-sm text-white/50">
          Saved: <span className="text-white font-semibold">RM{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          {' '}/ Target: <span className="text-white/70 font-medium">RM{goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              completed
                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Smart budget helper */}
        {!completed && remaining > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5">
            <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 font-medium">
              Save RM{monthlyNeeded.toLocaleString(undefined, { minimumFractionDigits: 2 })}/mo
            </span>
            to stay on track
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="relative z-10 flex sm:flex-col items-center gap-2 justify-center shrink-0">
        {!completed && (
          <button
            onClick={() => onAddSavings(goal)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 text-pink-400 text-xs font-medium transition-all whitespace-nowrap"
          >
            <Coins size={13} />
            Add Savings
          </button>
        )}
        <button
          onClick={() => onDelete(goal.id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/10 text-white/30 hover:text-red-400 text-xs font-medium transition-all whitespace-nowrap"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  )
}

export default function Goals() {
  const { goals, isCompleted, addGoal, deleteGoal, addSavings, loading, error } = useGoals()
  const [createOpen, setCreateOpen] = useState(false)
  const [savingsGoal, setSavingsGoal] = useState<Goal | null>(null)

  const { active, completed } = useMemo(() => {
    const active: Goal[] = []
    const completed: Goal[] = []
    for (const g of goals) {
      if (isCompleted(g.current_amount, g.target_amount)) completed.push(g)
      else active.push(g)
    }
    return { active, completed }
  }, [goals, isCompleted])

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-pink-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[200px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Goals</h1>
            <p className="text-sm text-white/30 mt-1 font-light">Track your savings progress</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 text-pink-400 text-sm font-medium transition-all duration-200"
          >
            <Plus size={15} />
            Create New Goal
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <Flag size={24} className="text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white/60 mb-2">No financial goals yet</h2>
            <p className="text-sm text-white/25 font-light max-w-xs">
              Create one to start tracking!
            </p>
          </div>
        )}

        {/* Active section */}
        {!loading && active.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Active</span>
              <span className="text-[11px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                {active.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {active.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  completed={false}
                  onAddSavings={setSavingsGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed section */}
        {!loading && completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Completed</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {completed.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  completed={true}
                  onAddSavings={setSavingsGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateGoalModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={addGoal}
      />

      <AddSavingsModal
        open={savingsGoal !== null}
        goal={savingsGoal}
        onClose={() => setSavingsGoal(null)}
        onAddSavings={addSavings}
      />
    </div>
  )
}