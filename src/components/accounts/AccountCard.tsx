import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { WalletAccount } from '../../hooks/useWallet'
import { CARD_THEMES } from '../../services/mockProviders'

interface Props {
  account: WalletAccount
  onDelete: (accountId: string) => Promise<boolean>
}

// ── EMV Chip SVG ─────────────────────────────────────────────────
function ChipIcon({ color }: { color: string }) {
  return (
    <svg width="38" height="30" viewBox="0 0 38 30" fill="none">
      <rect x="1" y="1" width="36" height="28" rx="4" stroke={color} strokeWidth="1.2" fill={`${color}18`} />
      <rect x="13" y="1" width="12" height="28" stroke={color} strokeWidth="0.8" fill={`${color}10`} />
      <rect x="1" y="10" width="36" height="10" stroke={color} strokeWidth="0.8" fill={`${color}10`} />
      <rect x="14" y="11" width="10" height="8" rx="1" stroke={color} strokeWidth="0.8" fill={`${color}20`} />
    </svg>
  )
}

// ── Mastercard logo ───────────────────────────────────────────────
function MastercardLogo() {
  return (
    <div className="flex items-center">
      <div className="w-7 h-7 rounded-full bg-red-500/80 -mr-3" />
      <div className="w-7 h-7 rounded-full bg-amber-400/80" />
    </div>
  )
}

// ── Visa logo ─────────────────────────────────────────────────────
function VisaLogo() {
  return (
    <span
      className="text-white/70 font-black italic tracking-tight text-lg leading-none"
      style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}
    >
      VISA
    </span>
  )
}

export default function AccountCard({ account, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const success = await onDelete(account.id)
    if (!success) setDeleting(false)
  }

  const theme = CARD_THEMES[account.provider.id] ?? CARD_THEMES['default']
  const isCash = account.platform_type === 'cash'

  return (
    <div
      className={`relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden group cursor-default
        bg-gradient-to-br ${theme.gradient}
        border border-white/[0.08]
        transition-all duration-500
        hover:scale-[1.02] hover:border-white/[0.15]`}
      style={{
        boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Noise texture overlay for matte effect */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Glossy top highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none rounded-t-2xl" />

      {/* Card content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-5">

        {/* ── Top row: bank name + badge ── */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-medium text-white/40 uppercase tracking-[0.2em]">
              {isCash ? 'Physical' : 'Debit'}
            </span>
            <span className="text-base font-bold text-white tracking-widest uppercase">
              {account.provider.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {account.isLive ? (
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                Live
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-white/20 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded-full">
                Demo
              </span>
            )}

            <div
              className="w-8 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${theme.chip}22`, border: `1px solid ${theme.chip}44` }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: `${theme.chip}80` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: `${theme.chip}60` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle row: EMV chip + Balance ── */}
        <div className="flex items-center gap-4">
          <ChipIcon color={theme.chip} />
          {account.isLoading ? (
            <div className="h-6 w-28 bg-white/[0.08] rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold text-white tracking-tight">
              {account.displayBalance}
            </p>
          )}
        </div>

        {/* ── Bottom row: country/currency + network logo ── */}
        <div className="flex items-end justify-between">
          <p className="text-[10px] text-white/25">
            {account.provider.country === 'ID'
              ? 'Indonesia'
              : account.provider.country === 'SG'
              ? 'Singapore'
              : 'Malaysia'}{' '}
            · {account.currency}
          </p>

          <div className="flex items-center">
            {theme.network === 'mastercard' && <MastercardLogo />}
            {theme.network === 'visa' && <VisaLogo />}
            {theme.network === 'cash' && (
              <span className="text-[10px] font-semibold text-emerald-400/50 uppercase tracking-widest">
                Liquid Fiat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete button — appears on hover, top-left corner ── */}
      {!confirmDelete && (
        <button
          onClick={() => setConfirmDelete(true)}
          className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm border border-white/[0.08] text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
        >
          <Trash2 size={12} />
        </button>
      )}

      {/* ── Confirm delete overlay ── */}
      {confirmDelete && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-5">
          <p className="text-sm font-semibold text-white text-center">
            Remove <span className="text-red-400">{account.provider.name}</span>?
          </p>
          <p className="text-[11px] text-white/40 text-center leading-relaxed">
            Transactions will be kept but unlinked.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 bg-white/[0.06] hover:bg-white/[0.10] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 transition-all disabled:opacity-40"
            >
              {deleting ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}