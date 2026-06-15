import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { WalletAccount } from '../../hooks/useWallet'

interface Props {
  account: WalletAccount
  onDelete: (accountId: string) => Promise<boolean>
}

export default function AccountCard({ account, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const success = await onDelete(account.id)
    if (!success) setDeleting(false)
  }

  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] overflow-hidden group">

      {/* Top row: logo + badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
            <img
              src={account.provider.logoUrl}
              alt={account.provider.name}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent && !parent.querySelector('span')) {
                  const span = document.createElement('span')
                  span.className = 'text-xs font-bold text-white/60'
                  span.textContent = account.provider.name.slice(0, 2).toUpperCase()
                  parent.appendChild(span)
                }
              }}
            />
          </div>
          <span className="text-sm font-medium text-white/80">{account.provider.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live / Demo badge */}
          {account.isLive ? (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
              Demo
            </span>
          )}

          {/* Trash icon — visible on hover only */}
          {!confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Balance */}
      {account.isLoading ? (
        <div className="h-7 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
      ) : account.error ? (
        <p className="text-xs text-red-400/70">{account.error}</p>
      ) : (
        <p className="text-2xl font-semibold text-white tracking-tight">
          {account.displayBalance}
        </p>
      )}

      {/* Country */}
      <p className="text-xs text-white/30 font-light">
        {account.provider.country === 'ID' ? 'Indonesia' : account.provider.country === 'SG' ? 'Singapore' : 'Malaysia'}
        {' · '}
        {account.currency}
      </p>

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <p className="text-sm font-medium text-white/80 text-center">
            Remove <span className="text-white">{account.provider.name}</span>?
          </p>
          <p className="text-xs text-white/30 text-center">
            Your transactions will be kept but unlinked from this account.
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-40"
            >
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}