import { useState } from 'react'
import { X, Loader2, Banknote } from 'lucide-react'
import { WalletAccount } from '../../hooks/useWallet'

interface Props {
  open: boolean
  accounts: WalletAccount[]
  onClose: () => void
  onWithdraw: (sourceAccountId: string, amount: number) => Promise<void>
}

export default function WithdrawModal({ open, accounts, onClose, onWithdraw }: Props) {
  const [sourceId, setSourceId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!open) return null

  // Only show bank accounts as source (not cash itself, not ewallets)
  const bankAccounts = accounts.filter(a => 
    a.platform_type === 'bank_my' || 
    a.platform_type === 'bank_sg' || 
    a.platform_type === 'bank_id'
  )

  async function handleSubmit() {
    setError(null)
    const parsed = parseFloat(amount)
    if (!sourceId) { setError('Please select a source account'); return }
    if (isNaN(parsed) || parsed <= 0) { setError('Please enter a valid amount'); return }

    setLoading(true)
    try {
      await onWithdraw(sourceId, parsed)
      // Reset and close on success
      setAmount('')
      setSourceId('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = accounts.find(a => a.id === sourceId)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Banknote size={16} className="text-pink-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Withdraw Cash</h2>
                <p className="text-xs text-white/30 mt-0.5">Transfer to Cash on Hand</p>
              </div>
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

            {/* Source account dropdown */}
            <div>
  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
    Source Account
  </label>
  <div className="relative">
    {/* Trigger button */}
    <button
      type="button"
      onClick={() => setDropdownOpen(prev => !prev)}
      className="w-full bg-white/[0.03] border border-white/[0.08] text-sm rounded-xl px-3 py-2.5 outline-none focus:border-pink-500/40 transition-colors flex items-center justify-between"
    >
      <span className={sourceId ? 'text-white/80' : 'text-white/25'}>
        {sourceId
          ? (() => {
              const a = bankAccounts.find(a => a.id === sourceId)
              return a ? `${a.provider.name} — ${a.displayBalance}` : 'Select a bank account'
            })()
          : 'Select a bank account'
        }
      </span>
      <svg
        className={`w-4 h-4 text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* Options list — fully visible, no scroll */}
    {dropdownOpen && (
      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#141414] border border-white/[0.08] rounded-xl overflow-hidden z-10 shadow-2xl">
        {bankAccounts.length === 0 ? (
          <p className="px-4 py-3 text-sm text-white/30">No bank accounts connected</p>
        ) : (
          bankAccounts.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                setSourceId(a.id)
                setDropdownOpen(false)
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-white/[0.05] ${
                sourceId === a.id ? 'text-pink-400 bg-pink-500/5' : 'text-white/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={a.provider.logoUrl}
                  alt={a.provider.name}
                  className="w-5 h-5 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <span>{a.provider.name}</span>
              </div>
              <span className="text-white/40 text-xs font-medium">{a.displayBalance}</span>
            </button>
          ))
        )}
      </div>
    )}
  </div>
</div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Amount {selectedAccount && `(${selectedAccount.currency})`}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                  {selectedAccount?.currency ?? 'MYR'}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-white/[0.03] border border-white/[0.08] text-white text-sm rounded-xl pl-14 pr-4 py-2.5 outline-none focus:border-pink-500/40 transition-colors placeholder-white/20"
                />
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-base leading-none mt-0.5">💡</span>
              <p className="text-xs text-white/30 leading-relaxed">
                Your total balance won't change — this moves money from your bank to Cash on Hand.
              </p>
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
                  <><Loader2 size={14} className="animate-spin" /> Processing…</>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}